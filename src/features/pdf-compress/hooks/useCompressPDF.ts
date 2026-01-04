'use client';

import { useState, useCallback, useMemo } from 'react';
import { compressPDF, compressMultiplePDFs } from '../lib/compress-logic';
import { saveAndDownloadPDF, downloadFile, formatBytes } from '@/lib/pdf/file-utils';
import { useFileInfoLoader } from '@/hooks/useFileInfoLoader';
import type {
  CompressionLevel,
  CompressionAlgorithm,
  PDFFileInfo,
  UseCompressPDFReturn,
} from '../types';

export const useCompressPDF = (): UseCompressPDFReturn => {
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('balanced');
  const [compressionAlgorithm, setCompressionAlgorithm] = useState<CompressionAlgorithm>('automatic');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLoadingMessage, setProcessingLoadingMessage] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [processingSuccess, setProcessingSuccess] = useState<string | null>(null);
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: number;
    compressedSize: number;
    savings: number;
    savingsPercent: number;
    method: string;
  } | null>(null);

  const {
    fileInfos,
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
      noValidFiles: 'No valid PDF files were found. Please select PDF files.',
      invalidFiles: (fileNames: string[]) =>
        `The following files are not valid PDFs: ${fileNames.join(', ')}`,
      loadFailed: (fileName: string) =>
        `Failed to load ${fileName}. Please check your file.`,
    },
  });

  const pdfFiles = useMemo<PDFFileInfo[]>(
    () =>
      fileInfos.map((fileInfo) => ({
        id: fileInfo.id,
        file: fileInfo.file,
        fileName: fileInfo.fileName,
        fileSize: fileInfo.fileSize,
      })),
    [fileInfos]
  );

  const loadPDFFiles = useCallback(
    async (files: File[]) => {
      setCompressionStats(null);
      setProcessingError(null);
      setProcessingSuccess(null);
      await loadFiles(files);
    },
    [loadFiles]
  );

  const removePDFFile = useCallback(
    (id: string) => {
      removeFile(id);
      setCompressionStats(null);
      setProcessingError(null);
      setProcessingSuccess(null);
    },
    [removeFile]
  );

  const processCompression = useCallback(async () => {
    if (pdfFiles.length === 0) {
      setProcessingError('Please upload at least one PDF file.');
      return;
    }

    setIsProcessing(true);
    setProcessingError(null);
    setProcessingSuccess(null);
    setCompressionStats(null);
    setProcessingLoadingMessage('Preparing compression...');

    try {
      if (pdfFiles.length === 1) {
        const fileInfo = pdfFiles[0];
        setProcessingLoadingMessage(`Compressing ${fileInfo.fileName}...`);

        const result = await compressPDF(
          fileInfo.file,
          compressionLevel,
          compressionAlgorithm,
          (message) => setProcessingLoadingMessage(message)
        );

        saveAndDownloadPDF(result.bytes, fileInfo.fileName);

        setCompressionStats({
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          savings: result.savings,
          savingsPercent: result.savingsPercent,
          method: result.method,
        });

        if (result.savings > 0) {
          setProcessingSuccess(
            `Compression complete! Method: ${result.method}. ` +
              `File size reduced from ${formatBytes(result.originalSize)} to ${formatBytes(result.compressedSize)} ` +
              `(Saved ${result.savingsPercent}%).`
          );
        } else {
          setProcessingSuccess(
            `Compression finished. Method: ${result.method}. ` +
              `Could not reduce file size. Original: ${formatBytes(result.originalSize)}, ` +
              `New: ${formatBytes(result.compressedSize)}.`
          );
        }
      } else {
        setProcessingLoadingMessage('Compressing multiple PDFs...');
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        let totalOriginalSize = 0;
        let totalCompressedSize = 0;
        let totalSavings = 0;
        const methodsUsed: string[] = [];

        const files = pdfFiles.map((fileInfo) => fileInfo.file);
        const results = await compressMultiplePDFs(
          files,
          compressionLevel,
          compressionAlgorithm,
          (current, total, fileName) => {
            setProcessingLoadingMessage(
              `Compressing ${current}/${total}: ${fileName}...`
            );
          }
        );

        for (let i = 0; i < results.length; i++) {
          const fileInfo = pdfFiles[i];
          const result = results[i];
          totalOriginalSize += fileInfo.fileSize;
          totalCompressedSize += result.result.compressedSize;
          totalSavings += result.result.savings;
          if (!methodsUsed.includes(result.result.method)) {
            methodsUsed.push(result.result.method);
          }

          const baseName = fileInfo.fileName.replace(/\.pdf$/i, '');
          zip.file(`${baseName}_compressed.pdf`, result.bytes);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const totalSavingsPercent =
          totalSavings > 0
            ? Number.parseFloat(((totalSavings / totalOriginalSize) * 100).toFixed(1))
            : 0;

        downloadFile(zipBlob, undefined, 'compressed-pdfs.zip');

        setCompressionStats({
          originalSize: totalOriginalSize,
          compressedSize: totalCompressedSize,
          savings: totalSavings,
          savingsPercent: totalSavingsPercent,
          method: methodsUsed.join(', '),
        });

        if (totalSavings > 0) {
          setProcessingSuccess(
            `Compressed ${pdfFiles.length} PDF(s). ` +
              `Total size reduced from ${formatBytes(totalOriginalSize)} to ${formatBytes(totalCompressedSize)} ` +
              `(Saved ${totalSavingsPercent}%).`
          );
        } else {
          setProcessingSuccess(
            `Compressed ${pdfFiles.length} PDF(s). ` +
              `Total size: ${formatBytes(totalCompressedSize)}.`
          );
        }
      }
    } catch (err) {
      console.error('Compression error:', err);
      setProcessingError(
        err instanceof Error
          ? `An error occurred during compression: ${err.message}`
          : 'An error occurred during compression. Please check your files.'
      );
    } finally {
      setIsProcessing(false);
      setProcessingLoadingMessage(null);
    }
  }, [pdfFiles, compressionLevel, compressionAlgorithm]);

  const reset = useCallback(() => {
    resetFiles();
    setCompressionLevel('balanced');
    setCompressionAlgorithm('automatic');
    setProcessingError(null);
    setProcessingSuccess(null);
    setCompressionStats(null);
    setProcessingLoadingMessage(null);
    setIsProcessing(false);
  }, [resetFiles]);

  const loadingMessage = fileLoadingMessage || processingLoadingMessage;
  const error = fileError || processingError;
  const success = fileSuccess || processingSuccess;

  return {
    pdfFiles,
    compressionLevel,
    compressionAlgorithm,
    isProcessing,
    loadingMessage,
    error,
    success,
    compressionStats,
    loadPDFFiles,
    removePDFFile,
    setCompressionLevel,
    setCompressionAlgorithm,
    processCompression,
    reset,
  };
};

