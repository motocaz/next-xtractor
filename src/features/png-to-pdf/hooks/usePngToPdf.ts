'use client';

import { useState, useCallback } from 'react';
import { pngToPdf } from '../lib/png-to-pdf-logic';
import { handleImageToPdfResult } from '@/lib/pdf/image-to-pdf-utils';
import type { PngFileInfo, UsePngToPdfReturn } from '../types';

export const usePngToPdf = (): UsePngToPdfReturn => {
  const [pngFiles, setPngFiles] = useState<PngFileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [failedFiles, setFailedFiles] = useState<string[]>([]);

  const loadPngFiles = useCallback(async (files: File[]) => {
    if (!files || files.length === 0) {
      setError('Please select at least one PNG file.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Validating PNG files...');

    try {
      const validFiles: PngFileInfo[] = [];
      const invalidFiles: string[] = [];

      for (const file of files) {
        const isPng =
          file.type === 'image/png' ||
          file.name.toLowerCase().endsWith('.png');

        if (!isPng) {
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
          `The following files are not valid PNG images: ${invalidFiles.join(', ')}`
        );
      }

      if (validFiles.length === 0) {
        setError('No valid PNG files were found. Please select PNG image files.');
      } else {
        setPngFiles((prev) => [...prev, ...validFiles]);
        if (validFiles.length > 0 && invalidFiles.length === 0) {
          setSuccess(`${validFiles.length} PNG file(s) loaded successfully.`);
        }
      }
    } catch (err) {
      console.error('Error loading PNG files:', err);
      setError(
        err instanceof Error
          ? `Failed to load PNG files: ${err.message}`
          : 'Failed to load PNG files. Please check your files.'
      );
    } finally {
      setIsLoading(false);
      setLoadingMessage(null);
    }
  }, []);

  const removePngFile = useCallback((id: string) => {
    setPngFiles((prev) => prev.filter((file) => file.id !== id));
    setError(null);
    setSuccess(null);
  }, []);

  const processPngToPdf = useCallback(async () => {
    if (pngFiles.length === 0) {
      setError('Please upload at least one PNG file.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setFailedFiles([]);
    setLoadingMessage('Converting PNG to PDF...');

    try {
      const files = pngFiles.map((fileInfo) => fileInfo.file);
      const result = await pngToPdf(files);

      await handleImageToPdfResult({
        result,
        firstFileName: pngFiles[0]?.fileName || 'converted',
        extensionPattern: /\.(png|PNG)$/i,
        stateSetters: {
          setFailedFiles,
          setSuccess,
        },
      });
    } catch (err) {
      console.error('PNG to PDF conversion error:', err);
      setError(
        err instanceof Error
          ? `An error occurred while converting: ${err.message}`
          : 'An error occurred while converting PNG to PDF. One of the files may be invalid.'
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [pngFiles]);

  const reset = useCallback(() => {
    setPngFiles([]);
    setError(null);
    setSuccess(null);
    setFailedFiles([]);
    setLoadingMessage(null);
    setIsLoading(false);
    setIsProcessing(false);
  }, []);

  return {
    pngFiles,
    isLoading,
    isProcessing,
    loadingMessage,
    error,
    success,
    failedFiles,
    loadPngFiles,
    removePngFile,
    processPngToPdf,
    reset,
  };
};

