'use client';

import { useState, useCallback } from 'react';
import { changeTextColor } from '../lib/change-text-color-logic';
import { downloadFile } from '@/lib/pdf/file-utils';
import { usePDFProcessor } from '@/hooks/usePDFProcessor';
import type { UseChangeTextColorReturn } from '../types';

const DEFAULT_COLOR = '#FF0000';

export const useChangeTextColor = (): UseChangeTextColorReturn => {
  const [colorHex, setColorHex] = useState<string>(DEFAULT_COLOR);

  const {
    isProcessing,
    loadingMessage,
    error,
    success,
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
  }, [pdfFile, colorHex, setIsProcessing, setError, setSuccess, setLoadingMessage]);

  const handleSetColorHex = useCallback((color: string) => {
    setColorHex(color);
  }, []);

  const reset = useCallback(() => {
    setColorHex(DEFAULT_COLOR);
    resetProcessing();
    resetPDF();
  }, [resetProcessing, resetPDF]);

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

