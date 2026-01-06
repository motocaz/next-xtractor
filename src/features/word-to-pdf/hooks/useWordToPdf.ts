'use client';

import { useState, useCallback } from 'react';
import { convertWordToHtml, htmlToPdf } from '../lib/word-to-pdf-logic';
import type { UseWordToPdfReturn } from '../types';

export const useWordToPdf = (): UseWordToPdfReturn => {
  const [wordFile, setWordFile] = useState<File | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadWordFile = useCallback(async (file: File) => {
    const validMimeTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    const validExtensions = ['.docx', '.doc'];
    
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    const isValidMimeType = validMimeTypes.includes(file.type);
    const isValidExtension = validExtensions.includes(fileExtension);

    if (!isValidMimeType && !isValidExtension) {
      setError('Please upload a valid Word document (.docx or .doc file).');
      return;
    }

    setWordFile(file);
    setError(null);
    setHtmlContent(null);
  }, []);

  const convertToHtml = useCallback(async () => {
    if (!wordFile) {
      setError('Please upload a Word document first.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Converting Word document to HTML...');
    setError(null);

    try {
      const html = await convertWordToHtml(wordFile);
      setHtmlContent(html);
      setLoadingMessage(null);
    } catch (err) {
      console.error('Error converting Word to HTML:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Could not convert Word document. The file may be corrupt or contain unsupported features.'
      );
      setLoadingMessage(null);
    } finally {
      setIsLoading(false);
    }
  }, [wordFile]);

  const generatePdf = useCallback(async () => {
    if (!htmlContent) {
      setError('No HTML content available. Please convert the document first.');
      return;
    }

    setIsProcessing(true);
    setProcessingMessage('Generating High-Quality PDF...');
    setError(null);

    try {
      await htmlToPdf(
        htmlContent,
        wordFile?.name
      );
      setProcessingMessage(null);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while generating the PDF.'
      );
      setProcessingMessage(null);
    } finally {
      setIsProcessing(false);
    }
  }, [htmlContent, wordFile]);

  const convertAndDownloadPdf = useCallback(async () => {
    if (!wordFile) {
      setError('Please upload a Word document first.');
      return;
    }

    setError(null);

    let currentHtmlContent = htmlContent;
    if (!currentHtmlContent) {
      setIsLoading(true);
      setLoadingMessage('Converting Word document to HTML...');

      try {
        const html = await convertWordToHtml(wordFile);
        setHtmlContent(html);
        currentHtmlContent = html;
        setLoadingMessage(null);
      } catch (err) {
        console.error('Error converting Word to HTML:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Could not convert Word document. The file may be corrupt or contain unsupported features.'
        );
        setLoadingMessage(null);
        setIsLoading(false);
        return;
      } finally {
        setIsLoading(false);
      }
    }

    if (currentHtmlContent) {
      setIsProcessing(true);
      setProcessingMessage('Generating High-Quality PDF...');
      setError(null);

      try {
        await htmlToPdf(
          currentHtmlContent,
          wordFile?.name
        );
        setProcessingMessage(null);
      } catch (err) {
        console.error('Error generating PDF:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'An error occurred while generating the PDF.'
        );
        setProcessingMessage(null);
      } finally {
        setIsProcessing(false);
      }
    }
  }, [wordFile, htmlContent]);

  const reset = useCallback(() => {
    setWordFile(null);
    setHtmlContent(null);
    setError(null);
    setIsLoading(false);
    setLoadingMessage(null);
    setIsProcessing(false);
    setProcessingMessage(null);
  }, []);

  return {
    wordFile,
    htmlContent,
    isLoading,
    loadingMessage,
    isProcessing,
    processingMessage,
    error,
    loadWordFile,
    convertToHtml,
    generatePdf,
    convertAndDownloadPdf,
    reset,
  };
};

