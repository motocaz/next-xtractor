'use client';

import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { extractAttachmentsFromPDFs } from '../lib/extract-attachments-logic';
import { downloadFile, formatBytes } from '@/lib/pdf/file-utils';
import type { UseExtractAttachmentsReturn } from '../types';

export const useExtractAttachments = (): UseExtractAttachmentsReturn => {
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadPDFs = useCallback((files: File[]) => {
    setPdfFiles((prev) => {
      const newFiles = [...prev];
      for (const file of files) {
        if (!newFiles.some((f) => f.name === file.name && f.size === file.size)) {
          newFiles.push(file);
        }
      }
      return newFiles;
    });
    setError(null);
    setSuccess(null);
  }, []);

  const removePDF = useCallback((index: number) => {
    setPdfFiles((prev) => prev.filter((_, i) => i !== index));
    setError(null);
    setSuccess(null);
  }, []);

  const extractAttachments = useCallback(async () => {
    if (pdfFiles.length === 0) {
      setError('Please upload at least one PDF file.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Reading files...');

    try {
      setLoadingMessage('Extracting attachments from PDF(s)...');

      const attachments = await extractAttachmentsFromPDFs(pdfFiles);

      if (attachments.length === 0) {
        setError('No attachments were found in the selected PDF(s).');
        setIsProcessing(false);
        setLoadingMessage(null);
        return;
      }

      setLoadingMessage('Creating ZIP file...');

      const zip = new JSZip();
      let totalSize = 0;

      for (const attachment of attachments) {
        zip.file(attachment.name, new Uint8Array(attachment.data));
        totalSize += attachment.data.byteLength;
      }

      setLoadingMessage('Preparing download...');

      const zipBlob = await zip.generateAsync({ type: 'blob' });

      const baseName = pdfFiles[0].name.replace(/\.pdf$/i, '');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const zipFileName = `${timestamp}_${baseName}.zip`;

      downloadFile(zipBlob, undefined, zipFileName);

      const successMessage = `Extraction completed! ${attachments.length} attachment(s) in zip file (${formatBytes(totalSize)}). Download started.`;
      setSuccess(successMessage);

      setPdfFiles([]);
    } catch (err) {
      console.error('Error extracting attachments:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while extracting attachments.'
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [pdfFiles]);

  const reset = useCallback(() => {
    setPdfFiles([]);
    setIsProcessing(false);
    setLoadingMessage(null);
    setError(null);
    setSuccess(null);
  }, []);

  return {
    pdfFiles,
    isProcessing,
    loadingMessage,
    error,
    success,
    loadPDFs,
    removePDF,
    extractAttachments,
    reset,
  };
};

