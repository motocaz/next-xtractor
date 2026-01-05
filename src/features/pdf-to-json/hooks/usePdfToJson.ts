'use client';

import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { useFileInfoLoader } from '@/hooks/useFileInfoLoader';
import { convertPDFsToJSONs } from '../lib/pdf-to-json-logic';
import { downloadFile, formatBytes } from '@/lib/pdf/file-utils';
import type { UsePdfToJsonReturn } from '../types';

export const usePdfToJson = (): UsePdfToJsonReturn => {
  const {
    fileInfos: pdfFiles,
    isLoading,
    loadingMessage: fileLoadingMessage,
    error: fileError,
    success: fileSuccess,
    loadFiles,
    removeFile,
    reset: resetFiles,
  } = useFileInfoLoader({
    acceptMimeTypes: ['application/pdf'],
    acceptExtensions: ['.pdf'],
    errorMessages: {
      noFiles: 'Please select at least one PDF file.',
      noValidFiles: 'No valid PDF files were found.',
      invalidFiles: (fileNames: string[]) =>
        `The following files are not valid PDFs: ${fileNames.join(', ')}`,
    },
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLoadingMessage, setProcessingLoadingMessage] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [processingSuccess, setProcessingSuccess] = useState<string | null>(null);

  const loadPdfFiles = useCallback(
    async (files: File[]) => {
      await loadFiles(files);
    },
    [loadFiles]
  );

  const removePdfFile = useCallback(
    (id: string) => {
      removeFile(id);
    },
    [removeFile]
  );

  const processPdfToJson = useCallback(async () => {
    if (pdfFiles.length === 0) {
      setProcessingError('Please upload at least one PDF file.');
      return;
    }

    setIsProcessing(true);
    setProcessingError(null);
    setProcessingSuccess(null);
    setProcessingLoadingMessage('Reading files...');

    try {
      setProcessingLoadingMessage('Converting PDFs to JSON...');

      const files = pdfFiles.map((fileInfo) => fileInfo.file);
      const jsonFiles = await convertPDFsToJSONs(files);

      if (jsonFiles.length === 0) {
        setProcessingError('No JSON files were generated from the PDF files.');
        setIsProcessing(false);
        setProcessingLoadingMessage(null);
        return;
      }

      setProcessingLoadingMessage('Creating ZIP file...');

      const zip = new JSZip();
      let totalSize = 0;

      for (const jsonFile of jsonFiles) {
        const jsonName = jsonFile.name.replace(/\.pdf$/i, '.json');
        const uint8Array = new Uint8Array(jsonFile.data);
        zip.file(jsonName, uint8Array);
        totalSize += jsonFile.data.byteLength;
      }

      setProcessingLoadingMessage('Preparing download...');

      const zipBlob = await zip.generateAsync({ type: 'blob' });

      const baseName =
        pdfFiles[0]?.fileName.replace(/\.pdf$/i, '') || 'pdfs-to-json';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const zipFileName = `${timestamp}_${baseName}.zip`;

      downloadFile(zipBlob, undefined, zipFileName);

      const successMessage = `Conversion completed! ${jsonFiles.length} JSON file(s) in zip file (${formatBytes(totalSize)}). Download started.`;
      setProcessingSuccess(successMessage);

      resetFiles();
    } catch (err) {
      console.error('Error converting PDFs to JSONs:', err);
      setProcessingError(
        err instanceof Error
          ? err.message
          : 'An error occurred while converting PDFs to JSONs.'
      );
    } finally {
      setIsProcessing(false);
      setProcessingLoadingMessage(null);
    }
  }, [pdfFiles, resetFiles]);

  const reset = useCallback(() => {
    resetFiles();
    setIsProcessing(false);
    setProcessingLoadingMessage(null);
    setProcessingError(null);
    setProcessingSuccess(null);
  }, [resetFiles]);

  return {
    pdfFiles,
    isLoading,
    isProcessing,
    loadingMessage: processingLoadingMessage || fileLoadingMessage,
    error: processingError || fileError,
    success: processingSuccess || fileSuccess,
    loadPdfFiles,
    removePdfFile,
    processPdfToJson,
    reset,
  };
};

