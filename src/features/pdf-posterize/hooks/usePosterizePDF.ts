'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { usePDFProcessor } from '@/hooks/usePDFProcessor';
import { loadPDFWithPDFJSFromBuffer } from '@/lib/pdf/pdfjs-loader';
import { readFileAsArrayBuffer, saveAndDownloadPDF, parsePageRanges } from '@/lib/pdf/file-utils';
import { renderPageToCanvas } from '@/lib/pdf/canvas-utils';
import { posterizePDF } from '../lib/posterize-logic';
import type { UsePosterizePDFReturn, PageSizeKey, Orientation, ScalingMode, OverlapUnits } from '../types';

export const usePosterizePDF = (): UsePosterizePDFReturn => {
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [rows, setRows] = useState(1);
  const [cols, setCols] = useState(2);
  const [pageSize, setPageSize] = useState<PageSizeKey>('A4');
  const [orientation, setOrientation] = useState<Orientation>('auto');
  const [scalingMode, setScalingMode] = useState<ScalingMode>('fit');
  const [overlap, setOverlap] = useState(0);
  const [overlapUnits, setOverlapUnits] = useState<OverlapUnits>('pt');
  const [pageRange, setPageRange] = useState('');
  const [pageSnapshots, setPageSnapshots] = useState<Map<number, ImageData>>(new Map());

  const pdfJsDocRef = useRef<PDFDocumentProxy | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    pdfDoc,
    pdfFile,
    isLoadingPDF,
    pdfError,
    isProcessing,
    loadingMessage,
    error,
    success,
    totalPages,
    loadPDF: baseLoadPDF,
    resetPDF: baseResetPDF,
    setIsProcessing,
    setLoadingMessage,
    setError,
    setSuccess,
    resetProcessing,
  } = usePDFProcessor();

  const drawGridOverlay = useCallback(
    (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, pageNum: number) => {
      if (!pdfJsDocRef.current) return;

      const pagesToProcess = parsePageRanges(pageRange, pdfJsDocRef.current.numPages);
      const pageIndex = pageNum - 1;

      if (!pagesToProcess.includes(pageIndex)) {
        return; 
      }

      const snapshot = pageSnapshots.get(pageNum);
      if (snapshot) {
        context.putImageData(snapshot, 0, 0);
      }

      context.strokeStyle = 'rgba(239, 68, 68, 0.9)';
      context.lineWidth = 2;
      context.setLineDash([10, 5]);

      const cellWidth = canvas.width / cols;
      const cellHeight = canvas.height / rows;

      for (let i = 1; i < cols; i++) {
        context.beginPath();
        context.moveTo(i * cellWidth, 0);
        context.lineTo(i * cellWidth, canvas.height);
        context.stroke();
      }

      for (let i = 1; i < rows; i++) {
        context.beginPath();
        context.moveTo(0, i * cellHeight);
        context.lineTo(canvas.width, i * cellHeight);
        context.stroke();
      }

      context.setLineDash([]);
    },
    [rows, cols, pageRange, pageSnapshots]
  );

  const renderPreview = useCallback(
    async (pageNum: number) => {
      if (!pdfJsDocRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      if (pageSnapshots.has(pageNum)) {
        const snapshot = pageSnapshots.get(pageNum)!;
        canvas.width = snapshot.width;
        canvas.height = snapshot.height;
        context.putImageData(snapshot, 0, 0);
        drawGridOverlay(context, canvas, pageNum);
        return;
      }

      try {
        await renderPageToCanvas(pdfJsDocRef.current, pageNum, canvas, 1.5);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        setPageSnapshots((prev) => new Map(prev).set(pageNum, imageData));
        drawGridOverlay(context, canvas, pageNum);
      } catch (err) {
        console.error('Error rendering preview:', err);
        setError('Failed to render preview.');
      }
    },
    [pageSnapshots, drawGridOverlay, setError]
  );

  const loadPDF = useCallback(
    async (file: File) => {
      setCurrentPageNum(1);
      setPageSnapshots(new Map());
      pdfJsDocRef.current = null;
      setError(null);
      setSuccess(null);

      setLoadingMessage('Loading PDF...');
      setIsProcessing(true);

      try {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdfJsDoc = await loadPDFWithPDFJSFromBuffer(arrayBuffer);
        pdfJsDocRef.current = pdfJsDoc;

        await baseLoadPDF(file);

        if (pdfJsDoc.numPages > 0) {
          setCurrentPageNum(1);
        }

        setSuccess('PDF loaded successfully.');
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Could not load PDF. It may be corrupt or password-protected.'
        );
      } finally {
        setIsProcessing(false);
        setLoadingMessage(null);
      }
    },
    [baseLoadPDF, setError, setSuccess, setLoadingMessage, setIsProcessing]
  );

  const changePage = useCallback(
    async (offset: number) => {
      if (!pdfJsDocRef.current) return;

      const newPageNum = currentPageNum + offset;
      if (newPageNum < 1 || newPageNum > pdfJsDocRef.current.numPages) {
        return;
      }

      setCurrentPageNum(newPageNum);
      setLoadingMessage(`Rendering preview for page ${newPageNum}...`);

      try {
        await renderPreview(newPageNum);
        setLoadingMessage(null);
      } catch (err) {
        console.error('Error changing page:', err);
        setError('Failed to render page.');
        setLoadingMessage(null);
      }
    },
    [currentPageNum, renderPreview, setError, setLoadingMessage]
  );

  useEffect(() => {
    if (pdfJsDocRef.current && canvasRef.current && pdfFile && currentPageNum > 0) {
      const timer = setTimeout(() => {
        if (canvasRef.current && pdfJsDocRef.current) {
          renderPreview(currentPageNum);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pdfFile, currentPageNum, renderPreview]);

  useEffect(() => {
    if (pdfJsDocRef.current && canvasRef.current && pdfFile && pageSnapshots.has(currentPageNum)) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        drawGridOverlay(context, canvas, currentPageNum);
      }
    }
  }, [rows, cols, pageRange, currentPageNum, drawGridOverlay, pdfFile, pageSnapshots]);

  const posterize = useCallback(async () => {
    if (!pdfJsDocRef.current || !pdfFile) {
      setError('Please upload a PDF file first.');
      return;
    }

    setIsProcessing(true);
    setLoadingMessage('Posterizing PDF...');
    setError(null);
    setSuccess(null);

    try {
      const options = {
        rows,
        cols,
        pageSize,
        orientation,
        scalingMode,
        overlap,
        overlapUnits,
        pageRange,
      };

      const pdfBytes = await posterizePDF(
        pdfJsDocRef.current,
        options,
        (current, total) => {
          setLoadingMessage(`Processing page ${current} of ${total}...`);
        }
      );

      saveAndDownloadPDF(pdfBytes, pdfFile.name);
      setSuccess('Your PDF has been posterized successfully!');
    } catch (err) {
      console.error('Error posterizing PDF:', err);
      setError(err instanceof Error ? err.message : 'Could not posterize the PDF.');
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfJsDocRef,
    pdfFile,
    rows,
    cols,
    pageSize,
    orientation,
    scalingMode,
    overlap,
    overlapUnits,
    pageRange,
    setError,
    setSuccess,
    setIsProcessing,
    setLoadingMessage,
  ]);

  const reset = useCallback(() => {
    setCurrentPageNum(1);
    setRows(1);
    setCols(2);
    setPageSize('A4');
    setOrientation('auto');
    setScalingMode('fit');
    setOverlap(0);
    setOverlapUnits('pt');
    setPageRange('');
    setPageSnapshots(new Map());
    pdfJsDocRef.current = null;
    baseResetPDF();
    resetProcessing();
  }, [baseResetPDF, resetProcessing]);

  const resetPDF = useCallback(() => {
    reset();
  }, [reset]);

  return {
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages: pdfJsDocRef.current?.numPages || totalPages || 0,
    loadPDF,
    resetPDF,

    isProcessing,
    loadingMessage,
    error,
    success,

    currentPageNum,
    pdfJsDoc: pdfJsDocRef.current,
    canvasRef,

    rows,
    cols,
    pageSize,
    orientation,
    scalingMode,
    overlap,
    overlapUnits,
    pageRange,

    setRows,
    setCols,
    setPageSize,
    setOrientation,
    setScalingMode,
    setOverlap,
    setOverlapUnits,
    setPageRange,

    changePage,
    posterize,
    reset,
  };
};

