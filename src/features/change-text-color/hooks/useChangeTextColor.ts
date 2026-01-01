'use client';

import { useState, useCallback } from 'react';
import { changeTextColor } from '../lib/change-text-color-logic';
import { downloadFile } from '@/lib/pdf/file-utils';
import type { UseChangeTextColorReturn } from '../types';

const DEFAULT_COLOR = '#FF0000';

export const useChangeTextColor = (): UseChangeTextColorReturn => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [colorHex, setColorHex] = useState<string>(DEFAULT_COLOR);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const loadPDF = useCallback(async (file: File) => {
    if (file?.type !== 'application/pdf') {
      setPdfError('Please select a valid PDF file.');
      return;
    }

    setIsLoadingPDF(true);
    setPdfError(null);
    setError(null);
    setSuccess(null);

    try {
      setPdfFile(file);
    } catch (err) {
      console.error('Error loading PDF:', err);
      setPdfError(
        err instanceof Error
          ? err.message
          : 'Could not load PDF. It may be corrupted.'
      );
    } finally {
      setIsLoadingPDF(false);
    }
  }, []);

  const processTextColor = useCallback(async () => {
    if (!pdfFile) {
      setError('Please upload a PDF file first.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Initializing...');

    try {
      setLoadingMessage('Processing PDF...');

      const blob = await changeTextColor(pdfFile, colorHex, (current, total) => {
        setLoadingMessage(`Processing page ${current} of ${total}...`);
      });

      setLoadingMessage('Preparing download...');
      downloadFile(blob, pdfFile.name);

      setSuccess('Text color changed successfully!');
    } catch (err) {
      console.error('Error changing text color:', err);

      if (err instanceof Error) {
        setError(
          `An error occurred: ${err.message || 'Could not change text color.'}`
        );
      } else {
        setError('An error occurred while processing the PDF. Please try again.');
      }
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [pdfFile, colorHex]);

  const handleSetColorHex = useCallback((color: string) => {
    setColorHex(color);
  }, []);

  const reset = useCallback(() => {
    setPdfFile(null);
    setColorHex(DEFAULT_COLOR);
    setPdfError(null);
    setError(null);
    setSuccess(null);
    setLoadingMessage(null);
    setIsProcessing(false);
    setIsLoadingPDF(false);
  }, []);

  return {
    pdfFile,
    colorHex,
    isProcessing,
    loadingMessage,
    error,
    success,
    isLoadingPDF,
    pdfError,
    setColorHex: handleSetColorHex,
    loadPDF,
    processTextColor,
    reset,
  };
};

