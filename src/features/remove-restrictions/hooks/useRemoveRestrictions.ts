'use client';

import { useState, useCallback } from 'react';
import { removeRestrictions } from '../lib/remove-restrictions-logic';
import { downloadFile } from '@/lib/pdf/file-utils';
import type { UseRemoveRestrictionsReturn } from '../types';

export const useRemoveRestrictions = (): UseRemoveRestrictionsReturn => {
  const [ownerPassword, setOwnerPassword] = useState<string>('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadPDF = useCallback(async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setPdfError('Please select a valid PDF file.');
        return;
      }
    }

    setIsLoadingPDF(true);
    setPdfError(null);
    setError(null);

    try {
      setPdfFile(file);
    } catch (err) {
      console.error('Error loading PDF:', err);
      setPdfError(
        err instanceof Error
          ? err.message
          : 'Could not load PDF. It may be corrupt.'
      );
    } finally {
      setIsLoadingPDF(false);
    }
  }, []);

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
  }, [pdfFile, ownerPassword]);

  const reset = useCallback(() => {
    setOwnerPassword('');
    setPdfFile(null);
    setPdfError(null);
    setError(null);
    setSuccess(null);
    setLoadingMessage(null);
    setIsProcessing(false);
  }, []);

  return {
    ownerPassword,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc: null,
    isLoadingPDF,
    pdfError,
    totalPages: 0,
    setOwnerPassword,
    loadPDF,
    removeRestrictions: removeRestrictionsHandler,
    reset,
  };
};

