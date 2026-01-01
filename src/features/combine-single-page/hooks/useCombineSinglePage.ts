'use client';

import { useState, useCallback } from 'react';
import { combineToSinglePage } from '../lib/combine-single-page-logic';
import { downloadFile } from '@/lib/pdf/file-utils';
import type { UseCombineSinglePageReturn } from '../types';

const DEFAULT_SPACING = 18;
const DEFAULT_BACKGROUND_COLOR = '#FFFFFF';
const DEFAULT_ADD_SEPARATOR = false;

export const useCombineSinglePage = (): UseCombineSinglePageReturn => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [spacing, setSpacing] = useState<number>(DEFAULT_SPACING);
  const [backgroundColorHex, setBackgroundColorHex] = useState<string>(
    DEFAULT_BACKGROUND_COLOR
  );
  const [addSeparator, setAddSeparator] = useState<boolean>(
    DEFAULT_ADD_SEPARATOR
  );
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

  const processCombine = useCallback(async () => {
    if (!pdfFile) {
      setError('Please upload a PDF file first.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Initializing...');

    try {
      setLoadingMessage('Combining pages...');

      const blob = await combineToSinglePage(
        pdfFile,
        spacing,
        backgroundColorHex,
        addSeparator,
        (current, total) => {
          setLoadingMessage(`Processing page ${current} of ${total}...`);
        }
      );

      setLoadingMessage('Preparing download...');
      downloadFile(blob, pdfFile.name);

      setSuccess('Pages combined successfully!');
    } catch (err) {
      console.error('Error combining pages:', err);

      if (err instanceof Error) {
        setError(
          `An error occurred: ${err.message || 'Could not combine pages.'}`
        );
      } else {
        setError(
          'An error occurred while processing the PDF. Please try again.'
        );
      }
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [pdfFile, spacing, backgroundColorHex, addSeparator]);

  const handleSetSpacing = useCallback((value: number) => {
    setSpacing(value);
  }, []);

  const handleSetBackgroundColorHex = useCallback((color: string) => {
    setBackgroundColorHex(color);
  }, []);

  const handleSetAddSeparator = useCallback((add: boolean) => {
    setAddSeparator(add);
  }, []);

  const reset = useCallback(() => {
    setPdfFile(null);
    setSpacing(DEFAULT_SPACING);
    setBackgroundColorHex(DEFAULT_BACKGROUND_COLOR);
    setAddSeparator(DEFAULT_ADD_SEPARATOR);
    setPdfError(null);
    setError(null);
    setSuccess(null);
    setLoadingMessage(null);
    setIsProcessing(false);
    setIsLoadingPDF(false);
  }, []);

  return {
    pdfFile,
    spacing,
    backgroundColorHex,
    addSeparator,
    isProcessing,
    loadingMessage,
    error,
    success,
    isLoadingPDF,
    pdfError,
    setSpacing: handleSetSpacing,
    setBackgroundColorHex: handleSetBackgroundColorHex,
    setAddSeparator: handleSetAddSeparator,
    loadPDF,
    processCombine,
    reset,
  };
};

