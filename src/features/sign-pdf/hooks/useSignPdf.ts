'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { usePDFProcessor } from '@/hooks/usePDFProcessor';
import { loadPDFWithPDFJSFromBuffer } from '@/lib/pdf/pdfjs-loader';
import { readFileAsArrayBuffer } from '@/lib/pdf/file-utils';
import { saveAndDownloadPDF } from '@/lib/pdf/file-utils';
import { applySignaturesToPDF } from '../lib/sign-pdf-logic';
import type { UseSignPdfReturn, PlacedSignature, SavedSignature, InteractionMode, ResizeHandle } from '../types';
import { getHandleAtPos } from '../lib/signature-canvas';

export const useSignPdf = (): UseSignPdfReturn => {
  const {
    pdfDoc,
    pdfFile,
    isLoadingPDF,
    pdfError,
    loadPDF: loadPDFBase,
    resetPDF,
    totalPages,
    isProcessing,
    loadingMessage,
    error,
    success,
    setIsProcessing,
    setLoadingMessage,
    setError,
    setSuccess,
    resetProcessing,
  } = usePDFProcessor();

  const [pdfJsDoc, setPdfJsDoc] = useState<PDFDocumentProxy | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pageSnapshot, setPageSnapshot] = useState<ImageData | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  const [savedSignatures, setSavedSignatures] = useState<HTMLImageElement[]>([]);
  const [placedSignatures, setPlacedSignatures] = useState<PlacedSignature[]>([]);
  const [activeSignature, setActiveSignature] = useState<SavedSignature | null>(null);

  const [interactionMode, setInteractionMode] = useState<InteractionMode>('none');
  const [draggedSigId, setDraggedSigId] = useState<number | null>(null);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [hoveredSigId, setHoveredSigId] = useState<number | null>(null);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);

  const loadPDF = useCallback(
    async (file: File) => {
      await loadPDFBase(file);
      try {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdfJsDocument = await loadPDFWithPDFJSFromBuffer(arrayBuffer);
        setPdfJsDoc(pdfJsDocument);
        setCurrentPage(1);
        setScale(1.0);
        setPlacedSignatures([]);
        setActiveSignature(null);
      } catch (err) {
        console.error('Error loading PDF.js document:', err);
        setError('Failed to load PDF for rendering.');
      }
    },
    [loadPDFBase, setError]
  );


  const drawSignatures = useCallback(
    (context: CanvasRenderingContext2D, snapshot: ImageData, pageNum: number) => {
      context.putImageData(snapshot, 0, 0);

      placedSignatures
        .filter((sig) => sig.pageIndex === pageNum - 1)
        .forEach((sig) => {
          if (sig.image.complete && sig.image.naturalWidth > 0) {
            context.drawImage(sig.image, sig.x, sig.y, sig.width, sig.height);
          }

          if (hoveredSigId === sig.id || draggedSigId === sig.id) {
            context.strokeStyle = '#4f46e5';
            context.setLineDash([6, 3]);
            context.strokeRect(sig.x, sig.y, sig.width, sig.height);
            context.setLineDash([]);

            const handleSize = 8;
            const halfHandle = handleSize / 2;
            const handles = {
              'top-left': { x: sig.x, y: sig.y },
              'top-middle': { x: sig.x + sig.width / 2, y: sig.y },
              'top-right': { x: sig.x + sig.width, y: sig.y },
              'middle-left': { x: sig.x, y: sig.y + sig.height / 2 },
              'middle-right': { x: sig.x + sig.width, y: sig.y + sig.height / 2 },
              'bottom-left': { x: sig.x, y: sig.y + sig.height },
              'bottom-middle': { x: sig.x + sig.width / 2, y: sig.y + sig.height },
              'bottom-right': { x: sig.x + sig.width, y: sig.y + sig.height },
            };

            context.fillStyle = '#4f46e5';
            Object.values(handles).forEach((handle) => {
              context.fillRect(
                handle.x - halfHandle,
                handle.y - halfHandle,
                handleSize,
                handleSize
              );
            });
          }
        });
    },
    [placedSignatures, hoveredSigId, draggedSigId]
  );

  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfJsDoc || !canvasRef.current || !contextRef.current) return;

      setIsRendering(true);
      try {
        const page = await pdfJsDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = contextRef.current;

        const dpr = window.devicePixelRatio || 1;
        canvas.height = viewport.height * dpr;
        canvas.width = viewport.width * dpr;
        canvas.style.width = viewport.width + 'px';
        canvas.style.height = viewport.height + 'px';

        context.scale(dpr, dpr);

        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        }).promise;

        const snapshot = context.getImageData(0, 0, canvas.width / dpr, canvas.height / dpr);
        setPageSnapshot(snapshot);

        drawSignatures(context, snapshot, pageNum);
      } catch (err) {
        console.error('Error rendering page:', err);
        setError('Failed to render page.');
      } finally {
        setIsRendering(false);
      }
    },
    [pdfJsDoc, scale, drawSignatures, setError]
  );

  const fitToWidth = useCallback(async () => {
    if (!pdfJsDoc || !canvasRef.current) return;

    const page = await pdfJsDoc.getPage(currentPage);
    const container = canvasRef.current.parentElement;
    if (!container) return;

    const viewport = page.getViewport({ scale: 1.0 });
    const newScale = container.clientWidth / viewport.width;
    setScale(newScale);
  }, [pdfJsDoc, currentPage]);

  const zoomIn = useCallback(() => {
    setScale((prev) => prev + 0.25);
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(0.25, prev - 0.25));
  }, []);

  const addSignature = useCallback((imageDataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      setSavedSignatures((prev) => [...prev, img]);
    };
    img.onerror = () => {
      setError('Failed to load signature image.');
    };
    img.src = imageDataUrl;
  }, [setError]);

  const selectSignature = useCallback((index: number) => {
    const signature = savedSignatures[index];
    if (signature) {
      setActiveSignature({ image: signature, index });
    }
  }, [savedSignatures]);

  const placeSignature = useCallback(
    (x: number, y: number) => {
      if (!activeSignature || !contextRef.current) return;

      if (!activeSignature.image.complete || activeSignature.image.naturalWidth === 0) {
        setError('Signature image is not loaded yet. Please wait.');
        return;
      }

      const sigWidth = 150;
      const sigHeight =
        (activeSignature.image.height / activeSignature.image.width) * sigWidth;

      const newSignature: PlacedSignature = {
        id: Date.now(),
        image: activeSignature.image,
        x: x - sigWidth / 2,
        y: y - sigHeight / 2,
        width: sigWidth,
        height: sigHeight,
        pageIndex: currentPage - 1,
        aspectRatio: sigWidth / sigHeight,
      };

    setPlacedSignatures((prev) => [...prev, newSignature]);
    renderPage(currentPage);
    setActiveSignature(null);
  },
  [activeSignature, currentPage, renderPage, setError]
);

  const removeLastSignature = useCallback(() => {
    setPlacedSignatures((prev) => {
      const newSignatures = [...prev];
      newSignatures.pop();
      return newSignatures;
    });
    renderPage(currentPage);
  }, [currentPage, renderPage]);

  const applySignatures = useCallback(async () => {
    if (!pdfDoc || !pdfJsDoc) {
      setError('Please upload a PDF file first.');
      return;
    }

    if (placedSignatures.length === 0) {
      setError('Please place at least one signature.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Applying signatures...');

    try {
      const pdfBytes = await applySignaturesToPDF(
        pdfDoc,
        pdfJsDoc,
        placedSignatures,
        scale
      );
      saveAndDownloadPDF(pdfBytes, pdfFile?.name);
      setSuccess('Signatures applied successfully!');
    } catch (err) {
      console.error('Error applying signatures:', err);
      setError(err instanceof Error ? err.message : 'Failed to apply signatures.');
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [pdfDoc, pdfJsDoc, placedSignatures, scale, pdfFile, setIsProcessing, setLoadingMessage, setError, setSuccess]);

  const reset = useCallback(() => {
    resetPDF();
    resetProcessing();
    setPdfJsDoc(null);
    setCurrentPage(1);
    setScale(1.0);
    setPageSnapshot(null);
    setSavedSignatures([]);
    setPlacedSignatures([]);
    setActiveSignature(null);
    setInteractionMode('none');
    setDraggedSigId(null);
    setHoveredSigId(null);
    setResizeHandle(null);
  }, [resetPDF, resetProcessing]);

  const setCanvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
    if (canvas) {
      contextRef.current = canvas.getContext('2d', { willReadFrequently: true });
    } else {
      contextRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (pdfJsDoc && canvasRef.current && contextRef.current) {
      renderPage(currentPage);
    }
  }, [currentPage, scale, pdfJsDoc, renderPage, placedSignatures, hoveredSigId, draggedSigId]);

  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
      if (interactionMode !== 'none') return;

      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
      const clientY = 'touches' in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
      const pos = {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };

      let foundSigId: number | null = null;

      placedSignatures
        .filter((s) => s.pageIndex === currentPage - 1)
        .reverse()
        .forEach((sig) => {
          if (foundSigId) return;
          const handle = getHandleAtPos(pos, sig);
          if (handle) {
            foundSigId = sig.id;
          } else if (
            pos.x >= sig.x &&
            pos.x <= sig.x + sig.width &&
            pos.y >= sig.y &&
            pos.y <= sig.y + sig.height
          ) {
            foundSigId = sig.id;
          }
        });

      if (hoveredSigId !== foundSigId) {
        setHoveredSigId(foundSigId);
        renderPage(currentPage);
      }
    },
    [interactionMode, placedSignatures, currentPage, hoveredSigId, renderPage]
  );

  const handleDragStart = useCallback(
    (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
      const clientY = 'touches' in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
      const pos = {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };

      let clickedOnSignature = false;

      placedSignatures
        .filter((s) => s.pageIndex === currentPage - 1)
        .reverse()
        .forEach((sig) => {
          if (clickedOnSignature) return;
          const handle = getHandleAtPos(pos, sig);
          if (handle) {
            setInteractionMode('resize');
            setResizeHandle(handle);
            setDraggedSigId(sig.id);
            clickedOnSignature = true;
          } else if (
            pos.x >= sig.x &&
            pos.x <= sig.x + sig.width &&
            pos.y >= sig.y &&
            pos.y <= sig.y + sig.height
          ) {
            setInteractionMode('drag');
            setDraggedSigId(sig.id);
            setDragOffsetX(pos.x - sig.x);
            setDragOffsetY(pos.y - sig.y);
            clickedOnSignature = true;
          }
        });

      if (!clickedOnSignature && activeSignature) {
        placeSignature(pos.x, pos.y);
      }
    },
    [placedSignatures, currentPage, activeSignature, placeSignature]
  );

  const handleDragMove = useCallback(
    (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
      if (interactionMode === 'none' || draggedSigId === null) return;

      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
      const clientY = 'touches' in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
      const pos = {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };

      setPlacedSignatures((prev) => {
        const sig = prev.find((s) => s.id === draggedSigId);
        if (!sig) return prev;

        const newSig = { ...sig };

        if (interactionMode === 'drag') {
          newSig.x = pos.x - dragOffsetX;
          newSig.y = pos.y - dragOffsetY;
        } else if (interactionMode === 'resize' && resizeHandle) {
          const originalRight = sig.x + sig.width;
          const originalBottom = sig.y + sig.height;

          if (resizeHandle.includes('right'))
            newSig.width = Math.max(20, pos.x - sig.x);
          if (resizeHandle.includes('bottom'))
            newSig.height = Math.max(20, pos.y - sig.y);
          if (resizeHandle.includes('left')) {
            newSig.width = Math.max(20, originalRight - pos.x);
            newSig.x = originalRight - newSig.width;
          }
          if (resizeHandle.includes('top')) {
            newSig.height = Math.max(20, originalBottom - pos.y);
            newSig.y = originalBottom - newSig.height;
          }

          if (resizeHandle.includes('left') || resizeHandle.includes('right')) {
            newSig.height = newSig.width / sig.aspectRatio;
          } else if (resizeHandle.includes('top') || resizeHandle.includes('bottom')) {
            newSig.width = newSig.height * sig.aspectRatio;
          }
        }

        return prev.map((s) => (s.id === draggedSigId ? newSig : s));
      });

      renderPage(currentPage);
    },
    [interactionMode, draggedSigId, dragOffsetX, dragOffsetY, resizeHandle, currentPage, renderPage]
  );

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setInteractionMode('none');
    setDraggedSigId(null);
    renderPage(currentPage);
  }, [currentPage, renderPage]);

  return {
    pdfFile,
    pdfDoc,
    pdfJsDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    currentPage,
    scale,
    pageSnapshot,
    isRendering,
    savedSignatures,
    placedSignatures,
    activeSignature,
    interactionMode,
    draggedSigId,
    dragOffsetX,
    dragOffsetY,
    hoveredSigId,
    resizeHandle,
    isProcessing,
    loadingMessage,
    error,
    success,
    setError,
    loadPDF,
    renderPage,
    fitToWidth,
    zoomIn,
    zoomOut,
    addSignature,
    selectSignature,
    placeSignature,
    removeLastSignature,
    applySignatures,
    reset,
    setCanvasRef,
    handleMouseMove,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    setCurrentPage,
  };
};

