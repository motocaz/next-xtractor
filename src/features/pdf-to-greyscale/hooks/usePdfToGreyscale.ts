'use client';

import { useCallback } from 'react';
import { pdfToGreyscale } from '../lib/pdf-to-greyscale-logic';
import { saveAndDownloadPDF } from '@/lib/pdf/file-utils';
import { usePDFProcessor } from '@/hooks/usePDFProcessor';
import type { UsePdfToGreyscaleReturn } from '../types';

export const usePdfToGreyscale = (): UsePdfToGreyscaleReturn => {
  const {
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    loadPDF,
    resetPDF,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
    resetProcessing,
  } = usePDFProcessor();

  const processPdfToGreyscale = useCallback(async () => {
    if (!pdfFile) {
      setError('Please upload a PDF file first.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Converting PDF to greyscale...');

    try {
      const pdfBytes = await pdfToGreyscale(pdfFile, (current, total) => {
        setLoadingMessage(`Processing page ${current} of ${total}...`);
      });

      setLoadingMessage('Preparing download...');
      saveAndDownloadPDF(pdfBytes, pdfFile.name);
      setSuccess('PDF converted to greyscale successfully!');
    } catch (err) {
      console.error('Error converting to greyscale:', err);
      setError(
        err instanceof Error
          ? `Failed to convert to greyscale: ${err.message}`
          : 'Could not convert PDF to greyscale. Please check your inputs.'
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [pdfFile, setIsProcessing, setError, setSuccess, setLoadingMessage]);

  const reset = useCallback(() => {
    resetProcessing();
    resetPDF();
  }, [resetProcessing, resetPDF]);

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
    processPdfToGreyscale,
    reset,
  };
};

