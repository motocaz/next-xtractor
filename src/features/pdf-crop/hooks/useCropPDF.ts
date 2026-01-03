'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { PDFDocument } from 'pdf-lib';
import { usePDFProcessor } from '@/hooks/usePDFProcessor';
import { loadPDFWithPDFJSFromBuffer } from '@/lib/pdf/pdfjs-loader';
import { readFileAsArrayBuffer, saveAndDownloadPDF } from '@/lib/pdf/file-utils';
import { renderPageAsImage } from '@/lib/pdf/canvas-utils';
import { performMetadataCrop, performFlatteningCrop } from '../lib/crop-logic';
import type { CropData, CropMode, PageCrops, UseCropPDFReturn } from '../types';

export const useCropPDF = (): UseCropPDFReturn => {
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [pageCrops, setPageCrops] = useState<PageCrops>({});
  const [cropMode, setCropMode] = useState<CropMode>('metadata');
  const [applyToAll, setApplyToAll] = useState(false);
  const [currentPageImageUrl, setCurrentPageImageUrl] = useState<string | null>(null);
  const [originalPdfBytes, setOriginalPdfBytes] = useState<ArrayBuffer | null>(null);
  const pdfJsDocRef = useRef<PDFDocumentProxy | null>(null);
  const pdfDocRef = useRef<PDFDocument | null>(null);

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

  useEffect(() => {
    pdfDocRef.current = pdfDoc;
  }, [pdfDoc]);

  const loadPDF = useCallback(
    async (file: File) => {
      setPageCrops({});
      setCurrentPageNum(1);
      setCurrentPageImageUrl(null);
      setOriginalPdfBytes(null);
      pdfJsDocRef.current = null;

      setLoadingMessage('Loading PDF...');
      setIsProcessing(true);
      setError(null);
      setSuccess(null);

      try {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        setOriginalPdfBytes(arrayBuffer);

        const pdfJsDoc = await loadPDFWithPDFJSFromBuffer(arrayBuffer);
        pdfJsDocRef.current = pdfJsDoc;

        await baseLoadPDF(file);

        if (pdfJsDoc.numPages > 0) {
          setCurrentPageNum(1);
          const imageUrl = await renderPageAsImage(pdfJsDoc, 1);
          setCurrentPageImageUrl(imageUrl);
        }

        setSuccess('PDF loaded successfully. Please select an area to crop.');
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

  const saveCropData = useCallback(
    (cropData: CropData) => {
      if (currentPageNum > 0) {
        setPageCrops((prev) => ({
          ...prev,
          [currentPageNum]: cropData,
        }));
      }
    },
    [currentPageNum]
  );

  const changePage = useCallback(
    async (offset: number) => {
      if (!pdfJsDocRef.current) return;

      const newPageNum = currentPageNum + offset;
      if (newPageNum < 1 || newPageNum > pdfJsDocRef.current.numPages) {
        return;
      }

      setCurrentPageNum(newPageNum);
      setLoadingMessage(`Rendering page ${newPageNum}...`);

      try {
        const imageUrl = await renderPageAsImage(pdfJsDocRef.current, newPageNum);
        setCurrentPageImageUrl(imageUrl);
        setLoadingMessage(null);
      } catch (err) {
        console.error('Error rendering page:', err);
        setError('Failed to render page.');
        setLoadingMessage(null);
      }
    },
    [currentPageNum, setError, setLoadingMessage]
  );

  const applyCrop = useCallback(async (currentPageCrop?: CropData) => {
    if (!pdfJsDocRef.current || !originalPdfBytes || !pdfDocRef.current) {
      setError('Please load a PDF file first.');
      return;
    }

    let finalCropData: PageCrops;

    if (applyToAll) {
      const currentCrop = currentPageCrop || pageCrops[currentPageNum];
      if (!currentCrop) {
        setError('Please select an area to crop first.');
        return;
      }
      finalCropData = {};
      for (let i = 1; i <= pdfJsDocRef.current.numPages; i++) {
        finalCropData[i] = currentCrop;
      }
    } else {
      finalCropData = { ...pageCrops };
      if (currentPageCrop && !finalCropData[currentPageNum]) {
        finalCropData[currentPageNum] = currentPageCrop;
      }
    }

    if (Object.keys(finalCropData).length === 0) {
      setError('Please select an area on at least one page to crop.');
      return;
    }

    setIsProcessing(true);
    setLoadingMessage('Applying crop...');
    setError(null);
    setSuccess(null);

    try {
      let finalPdfBytes: Uint8Array;

      if (cropMode === 'flattening') {
        const newPdfDoc = await performFlatteningCrop(
          pdfJsDocRef.current,
          finalCropData,
          originalPdfBytes,
          setLoadingMessage
        );
        finalPdfBytes = await newPdfDoc.save();
      } else {
        const modifiedPdfDoc = await performMetadataCrop(
          pdfDocRef.current,
          finalCropData
        );
        finalPdfBytes = await modifiedPdfDoc.save();
      }

      const fileName = pdfFile?.name || 'cropped.pdf';
      saveAndDownloadPDF(finalPdfBytes, fileName);

      setSuccess('Crop complete! Your download has started.');
    } catch (err) {
      console.error('Error applying crop:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred during cropping.'
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfJsDocRef,
    originalPdfBytes,
    pageCrops,
    currentPageNum,
    applyToAll,
    cropMode,
    pdfFile,
    setError,
    setSuccess,
    setIsProcessing,
    setLoadingMessage,
  ]);

  const reset = useCallback(() => {
    setPageCrops({});
    setCurrentPageNum(1);
    setCropMode('metadata');
    setApplyToAll(false);
    setCurrentPageImageUrl(null);
    setOriginalPdfBytes(null);
    pdfJsDocRef.current = null;
    pdfDocRef.current = null;
    baseResetPDF();
    resetProcessing();
  }, [baseResetPDF, resetProcessing]);

  const effectiveTotalPages = pdfJsDocRef.current?.numPages || totalPages || 0;

  return {
    pdfFile,
    isLoadingPDF: isLoadingPDF || isProcessing,
    pdfError: pdfError || error,
    loadPDF,
    resetPDF: reset,
    totalPages: effectiveTotalPages,

    isProcessing,
    loadingMessage,
    error,
    success,

    currentPageNum,
    pageCrops,
    cropMode,
    applyToAll,
    currentPageImageUrl,

    setCropMode,
    setApplyToAll,
    changePage,
    saveCurrentCrop: saveCropData,
    applyCrop,
    setError,
    reset,
  };
};
