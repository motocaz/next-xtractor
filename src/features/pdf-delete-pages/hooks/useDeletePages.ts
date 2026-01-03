'use client';

import { useState, useCallback } from 'react';
import { deletePages } from '../lib/delete-pages-logic';
import { downloadFile } from '@/lib/pdf/file-utils';
import { usePDFProcessor } from '@/hooks/usePDFProcessor';
import type { UseDeletePagesReturn } from '../types';

export const useDeletePages = (): UseDeletePagesReturn => {
  const [pagesToDelete, setPagesToDelete] = useState<string>('');

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
    totalPages,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
    resetProcessing,
  } = usePDFProcessor();

  const deletePagesHandler = useCallback(async () => {
    if (!pdfFile) {
      setError('Please upload a PDF file first.');
      return;
    }

    if (!pdfDoc) {
      setError('PDF document is not loaded. Please try uploading again.');
      return;
    }

    if (!pagesToDelete || pagesToDelete.trim() === '') {
      setError('Please enter page numbers to delete.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Deleting pages...');

    try {
      const blob = await deletePages(pdfDoc, pagesToDelete);

      setLoadingMessage('Preparing download...');
      downloadFile(blob, pdfFile.name);

      setSuccess('Pages deleted successfully! Your download has started.');
    } catch (err) {
      console.error('Error deleting pages:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Could not delete pages. Please check your input and try again.'
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfFile,
    pdfDoc,
    pagesToDelete,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
  ]);

  const reset = useCallback(() => {
    setPagesToDelete('');
    resetProcessing();
    resetPDF();
  }, [resetProcessing, resetPDF]);

  return {
    pagesToDelete,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    setPagesToDelete,
    loadPDF,
    deletePages: deletePagesHandler,
    reset,
  };
};

