'use client';

import { useState, useCallback } from 'react';
import { svgToPdf } from '../lib/svg-to-pdf-logic';
import { handleImageToPdfResult } from '@/lib/pdf/image-to-pdf-utils';
import type { SvgFileInfo, UseSvgToPdfReturn } from '../types';

export const useSvgToPdf = (): UseSvgToPdfReturn => {
  const [svgFiles, setSvgFiles] = useState<SvgFileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [failedFiles, setFailedFiles] = useState<string[]>([]);

  const loadSvgFiles = useCallback(async (files: File[]) => {
    if (!files || files.length === 0) {
      setError('Please select at least one SVG file.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Validating SVG files...');

    try {
      const validFiles: SvgFileInfo[] = [];
      const invalidFiles: string[] = [];

      for (const file of files) {
        const isSvg =
          file.type === 'image/svg+xml' ||
          file.name.toLowerCase().endsWith('.svg');

        if (!isSvg) {
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
          `The following files are not valid SVG images: ${invalidFiles.join(', ')}`
        );
      }

      if (validFiles.length === 0) {
        setError('No valid SVG files were found. Please select SVG image files.');
      } else {
        setSvgFiles((prev) => [...prev, ...validFiles]);
        if (validFiles.length > 0 && invalidFiles.length === 0) {
          setSuccess(`${validFiles.length} SVG file(s) loaded successfully.`);
        }
      }
    } catch (err) {
      console.error('Error loading SVG files:', err);
      setError(
        err instanceof Error
          ? `Failed to load SVG files: ${err.message}`
          : 'Failed to load SVG files. Please check your files.'
      );
    } finally {
      setIsLoading(false);
      setLoadingMessage(null);
    }
  }, []);

  const removeSvgFile = useCallback((id: string) => {
    setSvgFiles((prev) => prev.filter((file) => file.id !== id));
    setError(null);
    setSuccess(null);
  }, []);

  const processSvgToPdf = useCallback(async () => {
    if (svgFiles.length === 0) {
      setError('Please upload at least one SVG file.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setFailedFiles([]);
    setLoadingMessage('Converting SVG to PDF...');

    try {
      const files = svgFiles.map((fileInfo) => fileInfo.file);
      const result = await svgToPdf(files);

      await handleImageToPdfResult({
        result,
        firstFileName: svgFiles[0]?.fileName || 'converted',
        extensionPattern: /\.(svg|SVG)$/i,
        stateSetters: {
          setFailedFiles,
          setSuccess,
        },
      });
    } catch (err) {
      console.error('SVG to PDF conversion error:', err);
      setError(
        err instanceof Error
          ? `An error occurred while converting: ${err.message}`
          : 'An error occurred while converting SVG to PDF. One of the files may be invalid.'
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [svgFiles]);

  const reset = useCallback(() => {
    setSvgFiles([]);
    setError(null);
    setSuccess(null);
    setFailedFiles([]);
    setLoadingMessage(null);
    setIsLoading(false);
    setIsProcessing(false);
  }, []);

  return {
    svgFiles,
    isLoading,
    isProcessing,
    loadingMessage,
    error,
    success,
    failedFiles,
    loadSvgFiles,
    removeSvgFile,
    processSvgToPdf,
    reset,
  };
};

