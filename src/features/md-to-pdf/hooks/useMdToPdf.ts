'use client';

import { useState, useCallback } from 'react';
import { mdToPdf } from '../lib/md-to-pdf-logic';
import { downloadFile } from '@/lib/pdf/file-utils';
import type { UseMdToPdfReturn, PageFormat, Orientation, MarginSize } from '../types';

export const useMdToPdf = (): UseMdToPdfReturn => {
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [pageFormat, setPageFormat] = useState<PageFormat>('a4');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [marginSize, setMarginSize] = useState<MarginSize>('normal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const processMdToPdf = useCallback(async () => {
    if (!markdownContent?.trim()) {
      setError('Please enter some Markdown text.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Generating High-Quality PDF...');

    try {
      const pdfBlob = await mdToPdf(markdownContent, {
        pageFormat,
        orientation,
        marginSize,
      });

      downloadFile(pdfBlob, undefined, 'markdown-document.pdf');
      setSuccess('PDF generated successfully!');
    } catch (err) {
      console.error('MD to PDF conversion error:', err);
      setError(
        err instanceof Error
          ? `An error occurred while generating PDF: ${err.message}`
          : 'An error occurred while generating PDF. Please check your Markdown content.'
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [markdownContent, pageFormat, orientation, marginSize]);

  const reset = useCallback(() => {
    setMarkdownContent('');
    setPageFormat('a4');
    setOrientation('portrait');
    setMarginSize('normal');
    setError(null);
    setSuccess(null);
    setLoadingMessage(null);
    setIsProcessing(false);
  }, []);

  return {
    markdownContent,
    pageFormat,
    orientation,
    marginSize,
    isProcessing,
    loadingMessage,
    error,
    success,
    setMarkdownContent,
    setPageFormat,
    setOrientation,
    setMarginSize,
    processMdToPdf,
    reset,
  };
};

