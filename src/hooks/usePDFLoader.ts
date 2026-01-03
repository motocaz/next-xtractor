'use client';

import { useState, useCallback } from 'react';
import type { PDFDocument } from 'pdf-lib';
import { loadPDFDocument } from '@/lib/pdf/pdf-loader';

export interface UsePDFLoaderReturn {
  pdfDoc: PDFDocument | null;
  pdfFile: File | null;
  isLoading: boolean;
  error: string | null;
  loadPDF: (file: File) => Promise<void>;
  reset: () => void;
}

export const usePDFLoader = (allowEncrypted = false): UsePDFLoaderReturn => {
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPDF = useCallback(async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await loadPDFDocument(file);
      
      if (result.isEncrypted && !allowEncrypted) {
        setError(
          'This PDF is password-protected. Please use the Decrypt tool first.'
        );
        setIsLoading(false);
        return;
      }

      setPdfDoc(result.pdfDoc);
      setPdfFile(file);
    } catch (err) {
      console.error('Error loading PDF:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load PDF. It may be corrupt or password-protected.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [allowEncrypted]);

  const reset = useCallback(() => {
    setPdfDoc(null);
    setPdfFile(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    pdfDoc,
    pdfFile,
    isLoading,
    error,
    loadPDF,
    reset,
  };
};

