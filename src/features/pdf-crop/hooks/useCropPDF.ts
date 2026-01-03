'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { PDFDocument } from 'pdf-lib';
import { usePDFProcessor } from '@/hooks/usePDFProcessor';
import { loadPDFWithPDFJSFromBuffer } from '@/lib/pdf/pdfjs-loader';
import { readFileAsArrayBuffer, downloadFile } from '@/lib/pdf/file-utils';
import { renderPageAsImage } from '../lib/page-renderer';
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

  // Sync pdfDoc to ref
  useEffect(() => {
    pdfDocRef.current = pdfDoc;
  }, [pdfDoc]);

  const loadPDF = useCallback(
    async (file: File) => {
      // Reset crop state
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
        // Load PDF file as array buffer
        const arrayBuffer = await readFileAsArrayBuffer(file);
        setOriginalPdfBytes(arrayBuffer);

        // Load with PDF.js for rendering
        const pdfJsDoc = await loadPDFWithPDFJSFromBuffer(arrayBuffer);
        pdfJsDocRef.current = pdfJsDoc;

        // Load with pdf-lib (via base hook)
        await baseLoadPDF(file);

        // Render first page
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
      // Use passed currentPageCrop if provided, otherwise fall back to state
      const currentCrop = currentPageCrop || pageCrops[currentPageNum];
      if (!currentCrop) {
        setError('Please select an area to crop first.');
        return;
      }
      // Apply current crop to all pages
      finalCropData = {};
      for (let i = 1; i <= pdfJsDocRef.current.numPages; i++) {
        finalCropData[i] = currentCrop;
      }
    } else {
      // Only process pages with saved crops
      finalCropData = { ...pageCrops };
      // If currentPageCrop is provided and not already in pageCrops, add it
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
        // Metadata crop
        const modifiedPdfDoc = await performMetadataCrop(
          pdfDocRef.current,
          finalCropData
        );
        finalPdfBytes = await modifiedPdfDoc.save();
      }

      // Convert Uint8Array to ArrayBuffer for Blob compatibility
      // Create a new ArrayBuffer to ensure type compatibility
      const arrayBuffer = new ArrayBuffer(finalPdfBytes.length);
      new Uint8Array(arrayBuffer).set(finalPdfBytes);
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const fileName = pdfFile?.name || 'cropped.pdf';
      downloadFile(blob, fileName);

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

  // Get total pages from PDF.js doc if available
  const effectiveTotalPages = pdfJsDocRef.current?.numPages || totalPages || 0;

  return {
    // PDF loading states
    pdfFile,
    isLoadingPDF: isLoadingPDF || isProcessing,
    pdfError: pdfError || error,
    loadPDF,
    resetPDF: reset,
    totalPages: effectiveTotalPages,

    // Processing states
    isProcessing,
    loadingMessage,
    error,
    success,

    // Crop-specific states
    currentPageNum,
    pageCrops,
    cropMode,
    applyToAll,
    currentPageImageUrl,

    // Crop-specific actions
    setCropMode,
    setApplyToAll,
    changePage,
    saveCurrentCrop: saveCropData,
    applyCrop,
    setError,
    reset,
  };
};
