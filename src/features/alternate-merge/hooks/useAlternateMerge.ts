'use client';

import { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { readFileAsArrayBuffer } from '@/lib/pdf/file-utils';
import { downloadFile } from '@/lib/pdf/file-utils';
import { alternateMergePDFs } from '../lib/alternate-merge-logic';
import type { PDFFileInfo, UseAlternateMergeReturn } from '../types';

export const useAlternateMerge = (): UseAlternateMergeReturn => {
  const [pdfFiles, setPdfFiles] = useState<PDFFileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadPDFs = useCallback(async (files: File[]) => {
    if (!files || files.length === 0) {
      setError('Please select at least one PDF file.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setWarning(null);
    setSuccess(null);
    setLoadingMessage('Loading PDF documents...');

    try {
      const pdfInfos: PDFFileInfo[] = [];
      const encryptedFiles: string[] = [];

      for (const file of files) {
        if (file.type !== 'application/pdf') {
          continue;
        }

        try {
          const pdfBytes = await readFileAsArrayBuffer(file);
          const pdfDoc = await PDFDocument.load(pdfBytes, {
            ignoreEncryption: true,
          });

          if (pdfDoc.isEncrypted) {
            encryptedFiles.push(file.name);
            continue;
          }

          const pageCount = pdfDoc.getPageCount();
          const id = `${file.name}-${Date.now()}-${Math.random()}`;

          pdfInfos.push({
            id,
            file,
            pdfDoc,
            pageCount,
            fileName: file.name,
          });
        } catch (err) {
          console.error(`Failed to load PDF ${file.name}:`, err);
          setError(
            `Failed to load ${file.name}. The file may be corrupted or password-protected.`
          );
          setIsLoading(false);
          setLoadingMessage(null);
          return;
        }
      }

      if (encryptedFiles.length > 0) {
        setWarning(
          `The following PDFs are password-protected and were skipped. Please use the Decrypt tool first:\n${encryptedFiles.join('\n')}`
        );
      }

      if (pdfInfos.length === 0) {
        setError('No valid PDF files were loaded.');
      } else {
        setError(null);
        setPdfFiles((prev) => [...prev, ...pdfInfos]);
      }
    } catch (err) {
      console.error('Error loading PDFs:', err);
      setError(
        err instanceof Error
          ? `Failed to load PDFs: ${err.message}`
          : 'Failed to load PDF files. They may be corrupted or password-protected.'
      );
    } finally {
      setIsLoading(false);
      setLoadingMessage(null);
    }
  }, []);

  const removePDF = useCallback((id: string) => {
    setPdfFiles((prev) => prev.filter((pdf) => pdf.id !== id));
    setError(null);
    setWarning(null);
    setSuccess(null);
  }, []);

  const reorderFiles = useCallback((activeId: string, overId: string) => {
    if (activeId === overId) return;

    setPdfFiles((prev) => {
      const oldIndex = prev.findIndex((pdf) => pdf.id === activeId);
      const newIndex = prev.findIndex((pdf) => pdf.id === overId);

      if (oldIndex === -1 || newIndex === -1) return prev;

      const newFiles = [...prev];
      const [moved] = newFiles.splice(oldIndex, 1);
      newFiles.splice(newIndex, 0, moved);

      return newFiles;
    });
  }, []);

  const processAlternateMerge = useCallback(async () => {
    if (pdfFiles.length < 2) {
      setError('Please upload at least two PDF files to alternate and mix.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Alternating and mixing pages...');

    try {
      const pdfDocs = pdfFiles.map((pdfInfo) => pdfInfo.pdfDoc);
      const newPdfDoc = await alternateMergePDFs(pdfDocs);

      const mergedPdfBytes = await newPdfDoc.save();
      const arrayBuffer = new ArrayBuffer(mergedPdfBytes.length);
      new Uint8Array(arrayBuffer).set(mergedPdfBytes);
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });

      const firstFileName = pdfFiles[0]?.fileName || 'merged';
      downloadFile(blob, firstFileName);

      setSuccess('PDFs have been mixed successfully!');
    } catch (err) {
      console.error('Alternate Merge error:', err);
      setError(
        err instanceof Error
          ? `An error occurred while mixing the PDFs: ${err.message}`
          : 'An error occurred while mixing the PDFs.'
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [pdfFiles]);

  const reset = useCallback(() => {
    setPdfFiles([]);
    setError(null);
    setWarning(null);
    setSuccess(null);
    setLoadingMessage(null);
    setIsLoading(false);
    setIsProcessing(false);
  }, []);

  return {
    pdfFiles,
    isLoading,
    isProcessing,
    loadingMessage,
    error,
    warning,
    success,
    loadPDFs,
    removePDF,
    reorderFiles,
    processAlternateMerge,
    reset,
  };
};

