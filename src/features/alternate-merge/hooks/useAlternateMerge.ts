'use client';

import { useState, useCallback } from 'react';
import { saveAndDownloadPDF } from '@/lib/pdf/file-utils';
import { alternateMergePDFs } from '../lib/alternate-merge-logic';
import { useMultiPDFLoader } from '@/hooks/useMultiPDFLoader';
import type { UseAlternateMergeReturn } from '../types';

export const useAlternateMerge = (): UseAlternateMergeReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLoadingMessage, setProcessingLoadingMessage] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    pdfFiles,
    isLoading,
    loadingMessage,
    error: loaderError,
    warning,
    loadPDFs: loaderLoadPDFs,
    removePDF: loaderRemovePDF,
    reorderFiles,
    reset: loaderReset,
  } = useMultiPDFLoader({
    onEncryptedFiles: 'warning',
  });

  const loadPDFs = useCallback(
    async (files: File[]) => {
      setSuccess(null);
      await loaderLoadPDFs(files);
    },
    [loaderLoadPDFs]
  );

  const removePDF = useCallback(
    (id: string) => {
      loaderRemovePDF(id);
      setSuccess(null);
    },
    [loaderRemovePDF]
  );

  const processAlternateMerge = useCallback(async () => {
    if (pdfFiles.length < 2) {
      setProcessingError('Please upload at least two PDF files to alternate and mix.');
      return;
    }

    setIsProcessing(true);
    setProcessingError(null);
    setSuccess(null);
    setProcessingLoadingMessage('Alternating and mixing pages...');

    try {
      const pdfDocs = pdfFiles.map((pdfInfo) => pdfInfo.pdfDoc);
      const newPdfDoc = await alternateMergePDFs(pdfDocs);

      const mergedPdfBytes = await newPdfDoc.save();
      const firstFileName = pdfFiles[0]?.fileName || 'merged';
      saveAndDownloadPDF(mergedPdfBytes, firstFileName);

      setSuccess('PDFs have been mixed successfully!');
    } catch (err) {
      console.error('Alternate Merge error:', err);
      setProcessingError(
        err instanceof Error
          ? `An error occurred while mixing the PDFs: ${err.message}`
          : 'An error occurred while mixing the PDFs.'
      );
    } finally {
      setIsProcessing(false);
      setProcessingLoadingMessage(null);
    }
  }, [pdfFiles]);

  const reset = useCallback(() => {
    loaderReset();
    setSuccess(null);
    setProcessingError(null);
    setProcessingLoadingMessage(null);
    setIsProcessing(false);
  }, [loaderReset]);

  const combinedLoading = isLoading || isProcessing;
  const combinedLoadingMessage = loadingMessage || processingLoadingMessage;
  const combinedError = loaderError || processingError;

  return {
    pdfFiles,
    isLoading: combinedLoading,
    isProcessing,
    loadingMessage: combinedLoadingMessage,
    error: combinedError,
    warning,
    success,
    loadPDFs,
    removePDF,
    reorderFiles,
    processAlternateMerge,
    reset,
  };
};

