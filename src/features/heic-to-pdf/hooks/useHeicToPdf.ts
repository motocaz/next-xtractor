'use client';

import { useState, useCallback } from 'react';
import { heicToPdf } from '../lib/heic-to-pdf-logic';
import { handleImageToPdfResult } from '@/lib/pdf/image-to-pdf-utils';
import type { HeicFileInfo, UseHeicToPdfReturn } from '../types';

export const useHeicToPdf = (): UseHeicToPdfReturn => {
  const [heicFiles, setHeicFiles] = useState<HeicFileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [failedFiles, setFailedFiles] = useState<string[]>([]);

  const loadHeicFiles = useCallback(async (files: File[]) => {
    if (!files || files.length === 0) {
      setError('Please select at least one HEIC file.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Validating HEIC files...');

    try {
      const validFiles: HeicFileInfo[] = [];
      const invalidFiles: string[] = [];

      for (const file of files) {
        const fileNameLower = file.name.toLowerCase();
        const isHeic =
          file.type === 'image/heic' ||
          file.type === 'image/heif' ||
          fileNameLower.endsWith('.heic') ||
          fileNameLower.endsWith('.heif');

        if (!isHeic) {
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
          `The following files are not valid HEIC images: ${invalidFiles.join(', ')}`
        );
      }

      if (validFiles.length === 0) {
        setError('No valid HEIC files were found. Please select HEIC or HEIF image files.');
      } else {
        setHeicFiles((prev) => [...prev, ...validFiles]);
        if (validFiles.length > 0 && invalidFiles.length === 0) {
          setSuccess(`${validFiles.length} HEIC file(s) loaded successfully.`);
        }
      }
    } catch (err) {
      console.error('Error loading HEIC files:', err);
      setError(
        err instanceof Error
          ? `Failed to load HEIC files: ${err.message}`
          : 'Failed to load HEIC files. Please check your files.'
      );
    } finally {
      setIsLoading(false);
      setLoadingMessage(null);
    }
  }, []);

  const removeHeicFile = useCallback((id: string) => {
    setHeicFiles((prev) => prev.filter((file) => file.id !== id));
    setError(null);
    setSuccess(null);
  }, []);

  const processHeicToPdf = useCallback(async () => {
    if (heicFiles.length === 0) {
      setError('Please upload at least one HEIC file.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setFailedFiles([]);
    setLoadingMessage('Converting HEIC to PDF...');

    try {
      const files = heicFiles.map((fileInfo) => fileInfo.file);
      const result = await heicToPdf(files);

      await handleImageToPdfResult({
        result,
        firstFileName: heicFiles[0]?.fileName || 'converted',
        extensionPattern: /\.(heic|heif)$/i,
        stateSetters: {
          setFailedFiles,
          setSuccess,
        },
      });
    } catch (err) {
      console.error('HEIC to PDF conversion error:', err);
      setError(
        err instanceof Error
          ? `An error occurred while converting: ${err.message}`
          : 'An error occurred while converting HEIC to PDF. One of the files may be invalid or unsupported.'
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [heicFiles]);

  const reset = useCallback(() => {
    setHeicFiles([]);
    setError(null);
    setSuccess(null);
    setFailedFiles([]);
    setLoadingMessage(null);
    setIsLoading(false);
    setIsProcessing(false);
  }, []);

  return {
    heicFiles,
    isLoading,
    isProcessing,
    loadingMessage,
    error,
    success,
    failedFiles,
    loadHeicFiles,
    removeHeicFile,
    processHeicToPdf,
    reset,
  };
};

