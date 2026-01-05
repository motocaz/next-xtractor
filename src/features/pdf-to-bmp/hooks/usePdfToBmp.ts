'use client';

import { useCallback } from 'react';
import { usePDFProcessor } from '@/hooks/usePDFProcessor';
import { pdfToBmp } from '../lib/pdf-to-bmp-logic';
import { downloadFile } from '@/lib/pdf/file-utils';
import type { UsePdfToBmpReturn } from '../types';

export const usePdfToBmp = (): UsePdfToBmpReturn => {
  const {
    pdfFile,
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

  const processPdfToBmp = useCallback(async () => {
    if (!pdfFile) {
      setError('Please upload a PDF file first.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Converting PDF to BMP images...');

    try {
      const zipBlob = await pdfToBmp(pdfFile, (currentPage, totalPages) => {
        setLoadingMessage(`Processing page ${currentPage} of ${totalPages}...`);
      });

      setLoadingMessage('Compressing files into a ZIP...');

      const baseName = pdfFile.name.replace(/\.pdf$/i, '') || 'converted_bmp_images';
      const timestamp = new Date().toISOString();
      const filename = `${timestamp}_${baseName}.zip`;

      downloadFile(zipBlob, undefined, filename);
      setSuccess('PDF converted to BMP images successfully! ZIP file downloaded.');
    } catch (err) {
      console.error('PDF to BMP conversion error:', err);
      setError(
        err instanceof Error
          ? `Failed to convert PDF to BMP: ${err.message}`
          : 'Failed to convert PDF to BMP. The file might be corrupted.'
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [pdfFile, setIsProcessing, setLoadingMessage, setError, setSuccess]);

  const reset = useCallback(() => {
    resetPDF();
    resetProcessing();
  }, [resetPDF, resetProcessing]);

  return {
    pdfFile,
    isLoadingPDF,
    pdfError,
    isProcessing,
    loadingMessage,
    error,
    success,
    totalPages,
    loadPDF,
    resetPDF,
    processPdfToBmp,
    reset,
  };
};

