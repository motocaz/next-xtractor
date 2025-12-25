'use client';

import { useState, useCallback } from 'react';
import { addBlankPages } from '../lib/add-blank-page-logic';
import { downloadFile } from '@/lib/pdf/file-utils';
import { usePDFLoader } from '@/hooks/usePDFLoader';

export interface UseAddBlankPageReturn {
  pageNumber: string;
  pageCount: string;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  pdfFile: File | null;
  pdfDoc: ReturnType<typeof usePDFLoader>['pdfDoc'];
  isLoadingPDF: boolean;
  pdfError: string | null;
  totalPages: number;

  setPageNumber: (value: string) => void;
  setPageCount: (value: string) => void;
  loadPDF: (file: File) => Promise<void>;
  processBlankPages: () => Promise<void>;
  reset: () => void;
}

export const useAddBlankPage = (): UseAddBlankPageReturn => {
  const [pageNumber, setPageNumber] = useState<string>('');
  const [pageCount, setPageCount] = useState<string>('1');
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

  const processBlankPages = useCallback(async () => {
    if (!pdfDoc) {
      setError('Please upload a PDF file first.');
      return;
    }

    if (pageCount.trim() === '') {
      setError('Please enter the number of pages to insert.');
      return;
    }

    const position = pageNumber.trim() === '' 
      ? 0 
      : parseInt(pageNumber, 10);
    const count = parseInt(pageCount, 10);
    const total = pdfDoc.getPageCount();

    if (pageNumber.trim() !== '' && (isNaN(position) || position < 0 || position > total)) {
      setError(`Please enter a number between 0 and ${total}.`);
      return;
    }

    if (isNaN(count) || count < 1) {
      setError('Please enter a valid number of pages (1 or more).');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage(
      `Adding ${count} blank page${count > 1 ? 's' : ''}...`
    );

    try {
      const newPdf = await addBlankPages(pdfDoc, position, count);
      const pdfBytes = await newPdf.save();
      const arrayBuffer = new ArrayBuffer(pdfBytes.length);
      new Uint8Array(arrayBuffer).set(pdfBytes);
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });

      downloadFile(blob, pdfFile?.name);

      setSuccess(
        `Successfully added ${count} blank page${count > 1 ? 's' : ''}.`
      );
    } catch (err) {
      console.error('Error adding blank pages:', err);
      setError(
        err instanceof Error
          ? `Failed to add blank pages: ${err.message}`
          : `Could not add blank page${count > 1 ? 's' : ''}.`
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [pdfDoc, pageNumber, pageCount, pdfFile]);

  const reset = useCallback(() => {
    setPageNumber('');
    setPageCount('1');
    setError(null);
    setSuccess(null);
    setLoadingMessage(null);
    setIsProcessing(false);
    resetPDF();
  }, [resetPDF]);

  return {
    pageNumber,
    pageCount,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,

    setPageNumber,
    setPageCount,
    loadPDF,
    processBlankPages,
    reset,
  };
};

