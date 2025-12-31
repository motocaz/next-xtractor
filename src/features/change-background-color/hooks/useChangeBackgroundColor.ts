'use client';

import { useState, useCallback } from 'react';
import { changeBackgroundColor } from '../lib/change-background-color-logic';
import { downloadFile } from '@/lib/pdf/file-utils';
import { usePDFLoader } from '@/hooks/usePDFLoader';
import type { UseChangeBackgroundColorReturn } from '../types';

export const useChangeBackgroundColor = (): UseChangeBackgroundColorReturn => {
  const [backgroundColor, setBackgroundColor] = useState<string>('#FFFFFF');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    pdfDoc,
    pdfFile,
    isLoading: isLoadingPDF,
    error: pdfError,
    loadPDF,
    reset: resetPDF,
  } = usePDFLoader();

  const totalPages = pdfDoc ? pdfDoc.getPageCount() : 0;

  const processBackgroundColor = useCallback(async () => {
    if (!pdfDoc) {
      setError('Please upload a PDF file first.');
      return;
    }

    if (!backgroundColor || !/^#([A-Fa-f0-9]{6})$/.test(backgroundColor)) {
      setError('Please select a valid background color.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Changing background color...');

    try {
      const newPdf = await changeBackgroundColor(pdfDoc, backgroundColor);
      const pdfBytes = await newPdf.save();
      const arrayBuffer = new ArrayBuffer(pdfBytes.length);
      new Uint8Array(arrayBuffer).set(pdfBytes);
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });

      downloadFile(blob, pdfFile?.name);
      setSuccess('Background color changed successfully!');
    } catch (err) {
      console.error('Error changing background color:', err);
      setError(
        err instanceof Error
          ? `Failed to change background color: ${err.message}`
          : 'Could not change the background color. Please check your inputs.'
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [pdfDoc, backgroundColor, pdfFile]);

  const reset = useCallback(() => {
    setBackgroundColor('#FFFFFF');
    setError(null);
    setSuccess(null);
    setLoadingMessage(null);
    setIsProcessing(false);
    resetPDF();
  }, [resetPDF]);

  return {
    backgroundColor,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    setBackgroundColor,
    loadPDF,
    processBackgroundColor,
    reset,
  };
};

