'use client';

import { useState, useCallback } from 'react';
import { usePDFProcessor } from '@/hooks/usePDFProcessor';
import { pdfToWebp } from '../lib/pdf-to-webp-logic';
import { downloadFile } from '@/lib/pdf/file-utils';
import type { UsePdfToWebpReturn } from '../types';

export const usePdfToWebp = (): UsePdfToWebpReturn => {
  const [quality, setQuality] = useState<number>(0.9);
  
  const {
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    isProcessing,
    loadingMessage,
    error,
    success,
    totalPages,
    loadPDF,
    resetPDF,
    setIsProcessing,
    setLoadingMessage,
    setError,
    setSuccess,
    resetProcessing,
  } = usePDFProcessor();

  const processPdfToWebp = useCallback(async () => {
    if (!pdfFile) {
      setError('Please upload a PDF file first.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Converting PDF to WebP images...');

    try {
      const zipBlob = await pdfToWebp(pdfFile, quality, (currentPage, totalPages) => {
        setLoadingMessage(`Processing page ${currentPage} of ${totalPages}...`);
      });

      setLoadingMessage('Compressing files into a ZIP...');

      const baseName = pdfFile.name.replace(/\.pdf$/i, '') || 'converted_webp_images';
      const timestamp = new Date().toISOString();
      const filename = `${timestamp}_${baseName}.zip`;

      downloadFile(zipBlob, undefined, filename);
      setSuccess('PDF converted to WebP images successfully! ZIP file downloaded.');
    } catch (err) {
      console.error('PDF to WebP conversion error:', err);
      setError(
        err instanceof Error
          ? `Failed to convert PDF to WebP: ${err.message}`
          : 'Failed to convert PDF to WebP. The file might be corrupted.'
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [pdfFile, quality, setIsProcessing, setLoadingMessage, setError, setSuccess]);

  const reset = useCallback(() => {
    setQuality(0.9);
    resetPDF();
    resetProcessing();
  }, [resetPDF, resetProcessing]);

  return {
    pdfFile,
    pdfDoc,
    isProcessing,
    loadingMessage,
    error,
    success,
    isLoadingPDF,
    pdfError,
    totalPages,
    loadPDF,
    quality,
    setQuality,
    processPdfToWebp,
    reset,
  };
};

