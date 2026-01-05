'use client';

import { useCallback } from 'react';
import { usePDFProcessor } from '@/hooks/usePDFProcessor';
import { removeMetadata } from '../lib/remove-metadata-logic';
import { saveAndDownloadPDF } from '@/lib/pdf/file-utils';
import type { UseRemoveMetadataReturn } from '../types';

export const useRemoveMetadata = (): UseRemoveMetadataReturn => {
  const {
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfDoc,
    pdfFile,
    isLoadingPDF,
    pdfError,
    loadPDF,
    resetPDF,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
    resetProcessing,
  } = usePDFProcessor();

  const removeMetadataHandler = useCallback(async () => {
    if (!pdfFile) {
      setError('Please upload a PDF file first.');
      return;
    }

    if (!pdfDoc) {
      setError('PDF document is not loaded. Please try uploading again.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Removing all metadata...');

    try {
      removeMetadata(pdfDoc);
      
      setLoadingMessage('Saving PDF...');
      const pdfBytes = await pdfDoc.save();
      saveAndDownloadPDF(pdfBytes, pdfFile.name);

      setSuccess('Metadata removed successfully! Your download has started.');
    } catch (err) {
      console.error('Error removing metadata:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while trying to remove metadata.'
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfFile,
    pdfDoc,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
  ]);

  const reset = useCallback(() => {
    resetProcessing();
    resetPDF();
  }, [resetProcessing, resetPDF]);

  return {
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    loadPDF,
    removeMetadata: removeMetadataHandler,
    reset,
  };
};

