'use client';

import { useState, useCallback } from 'react';
import { removeRestrictions } from '../lib/remove-restrictions-logic';
import { downloadFile } from '@/lib/pdf/file-utils';
import { usePDFProcessor } from '@/hooks/usePDFProcessor';
import type { UseRemoveRestrictionsReturn } from '../types';

export const useRemoveRestrictions = (): UseRemoveRestrictionsReturn => {
  const [ownerPassword, setOwnerPassword] = useState<string>('');

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
  } = usePDFProcessor(true);

  const removeRestrictionsHandler = useCallback(async () => {
    if (!pdfFile) {
      setError('Please upload a PDF file first.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Initializing...');

    try {
      setLoadingMessage('Reading PDF...');
      setLoadingMessage('Removing restrictions...');

      const password = ownerPassword.trim().length > 0 ? ownerPassword : undefined;
      const blob = await removeRestrictions(pdfFile, password);

      setLoadingMessage('Preparing download...');
      downloadFile(blob, pdfFile.name);

      setSuccess(
        'PDF restrictions removed successfully! The file is now fully editable and printable.'
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error removing restrictions:', err);

      if (err.message?.includes('password') || err.message?.includes('encrypt')) {
        setError(
          'Failed to remove restrictions. The PDF may require the correct owner password.'
        );
      } else {
        setError(
          `An error occurred: ${
            err.message ||
            'The PDF might be corrupted or password-protected.'
          }`
        );
      }
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfFile,
    ownerPassword,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
  ]);

  const reset = useCallback(() => {
    setOwnerPassword('');
    resetProcessing();
    resetPDF();
  }, [resetProcessing, resetPDF]);

  return {
    ownerPassword,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    setOwnerPassword,
    loadPDF,
    removeRestrictions: removeRestrictionsHandler,
    reset,
  };
};

