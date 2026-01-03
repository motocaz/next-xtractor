'use client';

import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { extractPages } from '../lib/extract-pages-logic';
import { downloadFile, parsePageRanges } from '@/lib/pdf/file-utils';
import { usePDFProcessor } from '@/hooks/usePDFProcessor';
import type { UseExtractPagesReturn } from '../types';

export const useExtractPages = (): UseExtractPagesReturn => {
  const [pagesToExtract, setPagesToExtract] = useState<string>('');

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

  const extractPagesHandler = useCallback(async () => {
    if (!pdfFile) {
      setError('Please upload a PDF file first.');
      return;
    }

    if (!pdfDoc) {
      setError('PDF document is not loaded. Please try uploading again.');
      return;
    }

    if (!pagesToExtract || pagesToExtract.trim() === '') {
      setError('Please enter page numbers to extract.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Extracting pages...');

    try {
      const extractedPDFs = await extractPages(pdfDoc, pagesToExtract);

      if (extractedPDFs.length === 0) {
        setError('No valid pages selected for extraction.');
        setIsProcessing(false);
        setLoadingMessage(null);
        return;
      }

      setLoadingMessage('Creating ZIP file...');

      const zip = new JSZip();
      const sortedIndices = parsePageRanges(pagesToExtract, totalPages);

      for (let i = 0; i < extractedPDFs.length; i++) {
        const pageIndex = sortedIndices[i];
        const pageNumber = pageIndex + 1;
        zip.file(`page-${pageNumber}.pdf`, extractedPDFs[i]);
      }

      setLoadingMessage('Preparing download...');

      const zipBlob = await zip.generateAsync({ type: 'blob' });

      const baseName = pdfFile.name.replace(/\.pdf$/i, '');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const zipFileName = `${timestamp}_${baseName}.zip`;

      downloadFile(zipBlob, undefined, zipFileName);

      setSuccess(
        `Extraction completed! ${extractedPDFs.length} page(s) extracted. Download started.`
      );
    } catch (err) {
      console.error('Error extracting pages:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Could not extract pages. Please check your input and try again.'
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfFile,
    pdfDoc,
    pagesToExtract,
    totalPages,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
  ]);

  const reset = useCallback(() => {
    setPagesToExtract('');
    resetProcessing();
    resetPDF();
  }, [resetProcessing, resetPDF]);

  return {
    pagesToExtract,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    setPagesToExtract,
    loadPDF,
    extractPages: extractPagesHandler,
    reset,
  };
};

