'use client';

import { useState, useCallback } from 'react';
import { webpToPdf } from '../lib/webp-to-pdf-logic';
import { handleImageToPdfResult } from '@/lib/pdf/image-to-pdf-utils';
import type { WebpFileInfo, UseWebpToPdfReturn } from '../types';

export const useWebpToPdf = (): UseWebpToPdfReturn => {
  const [webpFiles, setWebpFiles] = useState<WebpFileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [failedFiles, setFailedFiles] = useState<string[]>([]);

  const loadWebpFiles = useCallback(async (files: File[]) => {
    if (!files || files.length === 0) {
      setError('Please select at least one WebP file.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Validating WebP files...');

    try {
      const validFiles: WebpFileInfo[] = [];
      const invalidFiles: string[] = [];

      for (const file of files) {
        const isWebp =
          file.type === 'image/webp' ||
          file.name.toLowerCase().endsWith('.webp');

        if (!isWebp) {
          invalidFiles.push(file.name);
          continue;
        }

        const id = `${file.name}-${Date.now()}-${Math.random()}`;
        validFiles.push({
          id,
          file,
          fileName: file.name,
          fileSize: file.size,
        });
      }

      if (invalidFiles.length > 0) {
        setError(
          `The following files are not valid WebP images: ${invalidFiles.join(', ')}`
        );
      }

      if (validFiles.length === 0) {
        setError('No valid WebP files were found. Please select WebP image files.');
      } else {
        setWebpFiles((prev) => [...prev, ...validFiles]);
        if (validFiles.length > 0 && invalidFiles.length === 0) {
          setSuccess(`${validFiles.length} WebP file(s) loaded successfully.`);
        }
      }
    } catch (err) {
      console.error('Error loading WebP files:', err);
      setError(
        err instanceof Error
          ? `Failed to load WebP files: ${err.message}`
          : 'Failed to load WebP files. Please check your files.'
      );
    } finally {
      setIsLoading(false);
      setLoadingMessage(null);
    }
  }, []);

  const removeWebpFile = useCallback((id: string) => {
    setWebpFiles((prev) => prev.filter((file) => file.id !== id));
    setError(null);
    setSuccess(null);
  }, []);

  const processWebpToPdf = useCallback(async () => {
    if (webpFiles.length === 0) {
      setError('Please upload at least one WebP file.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setFailedFiles([]);
    setLoadingMessage('Converting WebP to PDF...');

    try {
      const files = webpFiles.map((fileInfo) => fileInfo.file);
      const result = await webpToPdf(files);

      await handleImageToPdfResult({
        result,
        firstFileName: webpFiles[0]?.fileName || 'converted',
        extensionPattern: /\.(webp|WEBP)$/i,
        stateSetters: {
          setFailedFiles,
          setSuccess,
        },
      });
    } catch (err) {
      console.error('WebP to PDF conversion error:', err);
      setError(
        err instanceof Error
          ? `An error occurred while converting: ${err.message}`
          : 'An error occurred while converting WebP to PDF. One of the files may be invalid.'
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [webpFiles]);

  const reset = useCallback(() => {
    setWebpFiles([]);
    setError(null);
    setSuccess(null);
    setFailedFiles([]);
    setLoadingMessage(null);
    setIsLoading(false);
    setIsProcessing(false);
  }, []);

  return {
    webpFiles,
    isLoading,
    isProcessing,
    loadingMessage,
    error,
    success,
    failedFiles,
    loadWebpFiles,
    removeWebpFile,
    processWebpToPdf,
    reset,
  };
};

