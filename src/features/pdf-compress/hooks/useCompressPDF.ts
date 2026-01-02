'use client';

import { useState, useCallback } from 'react';
import { compressPDF, compressMultiplePDFs } from '../lib/compress-logic';
import { downloadFile, formatBytes } from '@/lib/pdf/file-utils';
import type {
  CompressionLevel,
  CompressionAlgorithm,
  PDFFileInfo,
  UseCompressPDFReturn,
} from '../types';

export const useCompressPDF = (): UseCompressPDFReturn => {
  const [pdfFiles, setPdfFiles] = useState<PDFFileInfo[]>([]);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('balanced');
  const [compressionAlgorithm, setCompressionAlgorithm] = useState<CompressionAlgorithm>('automatic');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: number;
    compressedSize: number;
    savings: number;
    savingsPercent: number;
    method: string;
  } | null>(null);

  const loadPDFFiles = useCallback(async (files: File[]) => {
    if (!files || files.length === 0) {
      setError('Please select at least one PDF file.');
      return;
    }

    setError(null);
    setSuccess(null);
    setCompressionStats(null);

    try {
      const validFiles: PDFFileInfo[] = [];
      const invalidFiles: string[] = [];

      for (const file of files) {
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
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
          `The following files are not valid PDFs: ${invalidFiles.join(', ')}`
        );
      }

      if (validFiles.length === 0) {
        setError('No valid PDF files were found. Please select PDF files.');
      } else {
        setPdfFiles((prev) => [...prev, ...validFiles]);
        if (validFiles.length > 0 && invalidFiles.length === 0) {
          setSuccess(`${validFiles.length} PDF file(s) loaded successfully.`);
        }
      }
    } catch (err) {
      console.error('Error loading PDF files:', err);
      setError(
        err instanceof Error
          ? `Failed to load PDF files: ${err.message}`
          : 'Failed to load PDF files. Please check your files.'
      );
    }
  }, []);

  const removePDFFile = useCallback((id: string) => {
    setPdfFiles((prev) => prev.filter((file) => file.id !== id));
    setError(null);
    setSuccess(null);
    setCompressionStats(null);
  }, []);

  const processCompression = useCallback(async () => {
    if (pdfFiles.length === 0) {
      setError('Please upload at least one PDF file.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setCompressionStats(null);
    setLoadingMessage('Preparing compression...');

    try {
      if (pdfFiles.length === 1) {
        const fileInfo = pdfFiles[0];
        setLoadingMessage(`Compressing ${fileInfo.fileName}...`);

        const result = await compressPDF(
          fileInfo.file,
          compressionLevel,
          compressionAlgorithm,
          (message) => setLoadingMessage(message)
        );

        const arrayBuffer = new ArrayBuffer(result.bytes.length);
        new Uint8Array(arrayBuffer).set(result.bytes);
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        downloadFile(blob, fileInfo.fileName);

        setCompressionStats({
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          savings: result.savings,
          savingsPercent: result.savingsPercent,
          method: result.method,
        });

        if (result.savings > 0) {
          setSuccess(
            `Compression complete! Method: ${result.method}. ` +
              `File size reduced from ${formatBytes(result.originalSize)} to ${formatBytes(result.compressedSize)} ` +
              `(Saved ${result.savingsPercent}%).`
          );
        } else {
          setSuccess(
            `Compression finished. Method: ${result.method}. ` +
              `Could not reduce file size. Original: ${formatBytes(result.originalSize)}, ` +
              `New: ${formatBytes(result.compressedSize)}.`
          );
        }
      } else {
        setLoadingMessage('Compressing multiple PDFs...');
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
            setLoadingMessage(
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
          setSuccess(
            `Compressed ${pdfFiles.length} PDF(s). ` +
              `Total size reduced from ${formatBytes(totalOriginalSize)} to ${formatBytes(totalCompressedSize)} ` +
              `(Saved ${totalSavingsPercent}%).`
          );
        } else {
          setSuccess(
            `Compressed ${pdfFiles.length} PDF(s). ` +
              `Total size: ${formatBytes(totalCompressedSize)}.`
          );
        }
      }
    } catch (err) {
      console.error('Compression error:', err);
      setError(
        err instanceof Error
          ? `An error occurred during compression: ${err.message}`
          : 'An error occurred during compression. Please check your files.'
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [pdfFiles, compressionLevel, compressionAlgorithm]);

  const reset = useCallback(() => {
    setPdfFiles([]);
    setCompressionLevel('balanced');
    setCompressionAlgorithm('automatic');
    setError(null);
    setSuccess(null);
    setCompressionStats(null);
    setLoadingMessage(null);
    setIsProcessing(false);
  }, []);

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

