'use client';

import { useState, useCallback } from 'react';
import { usePDFProcessor } from '@/hooks/usePDFProcessor';
import { sanitizePDF } from '../lib/sanitize-pdf-logic';
import { saveAndDownloadPDF } from '@/lib/pdf/file-utils';
import type { UseSanitizePDFReturn, SanitizeOptions } from '../types';

const DEFAULT_OPTIONS: SanitizeOptions = {
  flattenForms: true,
  removeMetadata: true,
  removeAnnotations: true,
  removeJavascript: true,
  removeEmbeddedFiles: true,
  removeLayers: true,
  removeLinks: true,
  removeStructureTree: false,
  removeMarkInfo: false,
  removeFonts: false,
};

export const useSanitizePDF = (): UseSanitizePDFReturn => {
  const [options, setOptions] = useState<SanitizeOptions>(DEFAULT_OPTIONS);

  const {
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfDoc,
    pdfFile,
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

  const setOption = useCallback(
    (key: keyof SanitizeOptions, value: boolean) => {
      setOptions((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const sanitizePDFHandler = useCallback(async () => {
    if (!pdfFile) {
      setError('Please upload a PDF file first.');
      return;
    }

    if (!pdfDoc) {
      setError('PDF document is not loaded. Please try uploading again.');
      return;
    }

    
    const hasAnyOption = Object.values(options).some((value) => value === true);
    if (!hasAnyOption) {
      setError('Please select at least one sanitization option.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Sanitizing PDF...');

    try {
      const changesMade = await sanitizePDF(pdfDoc, options);

      if (!changesMade) {
        setError(
          'No items were selected for removal or none were found in the PDF.'
        );
        setIsProcessing(false);
        setLoadingMessage(null);
        return;
      }

      setLoadingMessage('Saving PDF...');
      const pdfBytes = await pdfDoc.save();
      saveAndDownloadPDF(pdfBytes, pdfFile.name);

      setSuccess('PDF has been sanitized and downloaded successfully!');
    } catch (err) {
      console.error('Sanitization Error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred during sanitization.'
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfFile,
    pdfDoc,
    options,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
  ]);

  const reset = useCallback(() => {
    setOptions(DEFAULT_OPTIONS);
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
    totalPages,
    loadPDF,
    resetPDF,
    options,
    setOption,
    sanitizePDF: sanitizePDFHandler,
    reset,
  };
};

