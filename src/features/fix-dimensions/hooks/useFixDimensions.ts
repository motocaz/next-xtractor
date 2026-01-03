'use client';

import { useState, useCallback } from 'react';
import { fixDimensions } from '../lib/fix-dimensions-logic';
import { saveAndDownloadPDF } from '@/lib/pdf/file-utils';
import { usePDFProcessor } from '@/hooks/usePDFProcessor';
import type { UseFixDimensionsReturn } from '../types';

export const useFixDimensions = (): UseFixDimensionsReturn => {
  const [targetSize, setTargetSize] = useState<string>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [scalingMode, setScalingMode] = useState<'fit' | 'fill'>('fit');
  const [backgroundColor, setBackgroundColor] = useState<string>('#FFFFFF');
  const [customWidth, setCustomWidth] = useState<string>('8.5');
  const [customHeight, setCustomHeight] = useState<string>('11');
  const [customUnits, setCustomUnits] = useState<'in' | 'mm'>('in');

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

  const processFixDimensions = useCallback(async () => {
    if (!pdfDoc) {
      setError('Please upload a PDF file first.');
      return;
    }

    if (!pdfFile) {
      setError('PDF file is not available. Please try uploading again.');
      return;
    }

    if (targetSize === 'Custom') {
      const width = Number.parseFloat(customWidth);
      const height = Number.parseFloat(customHeight);

      if (Number.isNaN(width) || Number.isNaN(height) || width <= 0 || height <= 0) {
        setError('Please enter valid custom dimensions (width and height must be positive numbers).');
        return;
      }
    }

    if (!backgroundColor || !/^#([A-Fa-f0-9]{6})$/.test(backgroundColor)) {
      setError('Please select a valid background color.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Standardizing pages...');

    try {
      const options = {
        targetSize,
        orientation,
        scalingMode,
        backgroundColor,
        customWidth: targetSize === 'Custom' ? customWidth : undefined,
        customHeight: targetSize === 'Custom' ? customHeight : undefined,
        customUnits: targetSize === 'Custom' ? customUnits : undefined,
      };

      const newPdf = await fixDimensions(pdfDoc, options);
      const pdfBytes = await newPdf.save();
      saveAndDownloadPDF(pdfBytes, pdfFile.name);
      setSuccess('Pages standardized successfully!');
    } catch (err) {
      console.error('Error fixing dimensions:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Could not standardize pages. Please check your inputs and try again.'
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfDoc,
    pdfFile,
    targetSize,
    orientation,
    scalingMode,
    backgroundColor,
    customWidth,
    customHeight,
    customUnits,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
  ]);

  const reset = useCallback(() => {
    setTargetSize('A4');
    setOrientation('portrait');
    setScalingMode('fit');
    setBackgroundColor('#FFFFFF');
    setCustomWidth('8.5');
    setCustomHeight('11');
    setCustomUnits('in');
    resetProcessing();
    resetPDF();
  }, [resetProcessing, resetPDF]);

  return {
    targetSize,
    orientation,
    scalingMode,
    backgroundColor,
    customWidth,
    customHeight,
    customUnits,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    setTargetSize,
    setOrientation,
    setScalingMode,
    setBackgroundColor,
    setCustomWidth,
    setCustomHeight,
    setCustomUnits,
    loadPDF,
    processFixDimensions,
    reset,
  };
};

