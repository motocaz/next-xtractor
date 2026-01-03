'use client';

import { useState, useCallback } from 'react';
import { addHeaderFooter } from '../lib/add-header-footer-logic';
import { saveAndDownloadPDF } from '@/lib/pdf/file-utils';
import { usePDFProcessor } from '@/hooks/usePDFProcessor';
import type { UseAddHeaderFooterReturn } from '../types';

export const useAddHeaderFooter = (): UseAddHeaderFooterReturn => {
  const [pageRange, setPageRange] = useState<string>('');
  const [fontSize, setFontSize] = useState<string>('10');
  const [fontColor, setFontColor] = useState<string>('#000000');
  const [headerLeft, setHeaderLeft] = useState<string>('');
  const [headerCenter, setHeaderCenter] = useState<string>('');
  const [headerRight, setHeaderRight] = useState<string>('');
  const [footerLeft, setFooterLeft] = useState<string>('');
  const [footerCenter, setFooterCenter] = useState<string>('');
  const [footerRight, setFooterRight] = useState<string>('');

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

  const processHeaderFooter = useCallback(async () => {
    if (!pdfDoc) {
      setError('Please upload a PDF file first.');
      return;
    }

    const hasHeader =
      headerLeft.trim() !== '' ||
      headerCenter.trim() !== '' ||
      headerRight.trim() !== '';
    const hasFooter =
      footerLeft.trim() !== '' ||
      footerCenter.trim() !== '' ||
      footerRight.trim() !== '';

    if (!hasHeader && !hasFooter) {
      setError('Please provide at least one header or footer text.');
      return;
    }

    const fontSizeNum = Number.parseInt(fontSize, 10);
    if (isNaN(fontSizeNum) || fontSizeNum <= 0) {
      setError('Please enter a valid font size (greater than 0).');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Adding header & footer...');

    try {
      const options = {
        fontSize: fontSizeNum,
        fontColor,
        pageRange,
        headerLeft: headerLeft.trim(),
        headerCenter: headerCenter.trim(),
        headerRight: headerRight.trim(),
        footerLeft: footerLeft.trim(),
        footerCenter: footerCenter.trim(),
        footerRight: footerRight.trim(),
      };

      const newPdf = await addHeaderFooter(pdfDoc, options);
      const pdfBytes = await newPdf.save();
      saveAndDownloadPDF(pdfBytes, pdfFile?.name);

      setSuccess('Header and footer added successfully!');
    } catch (err) {
      console.error('Error adding header and footer:', err);
      setError(
        err instanceof Error
          ? `Failed to add header and footer: ${err.message}`
          : 'Could not add header or footer.'
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfDoc,
    pageRange,
    fontSize,
    fontColor,
    headerLeft,
    headerCenter,
    headerRight,
    footerLeft,
    footerCenter,
    footerRight,
    pdfFile,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
  ]);

  const reset = useCallback(() => {
    setPageRange('');
    setFontSize('10');
    setFontColor('#000000');
    setHeaderLeft('');
    setHeaderCenter('');
    setHeaderRight('');
    setFooterLeft('');
    setFooterCenter('');
    setFooterRight('');
    resetProcessing();
    resetPDF();
  }, [resetProcessing, resetPDF]);

  return {
    pageRange,
    fontSize,
    fontColor,
    headerLeft,
    headerCenter,
    headerRight,
    footerLeft,
    footerCenter,
    footerRight,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,

    setPageRange,
    setFontSize,
    setFontColor,
    setHeaderLeft,
    setHeaderCenter,
    setHeaderRight,
    setFooterLeft,
    setFooterCenter,
    setFooterRight,
    loadPDF,
    processHeaderFooter,
    reset,
  };
};

