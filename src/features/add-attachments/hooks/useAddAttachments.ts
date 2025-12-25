'use client';

import { useState, useCallback } from 'react';
import type { AttachmentFile } from '../types';
import { addAttachmentsToPDF } from '../lib/add-attachments-logic';
import { downloadFile } from '@/lib/pdf/file-utils';
import { usePDFLoader } from '@/hooks/usePDFLoader';

export interface UseAddAttachmentsReturn {
  attachments: AttachmentFile[];
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  pdfFile: File | null;
  pdfDoc: ReturnType<typeof usePDFLoader>['pdfDoc'];
  isLoadingPDF: boolean;
  pdfError: string | null;

  loadPDF: (file: File) => Promise<void>;
  addAttachmentFiles: (files: File[]) => void;
  removeAttachment: (index: number) => void;
  clearAttachments: () => void;
  processAttachments: () => Promise<void>;
  reset: () => void;
}

export const useAddAttachments = (): UseAddAttachmentsReturn => {
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    pdfDoc,
    pdfFile,
    isLoading: isLoadingPDF,
    error: pdfError,
    loadPDF,
    reset: resetPDF,
  } = usePDFLoader();

  const clearAttachments = useCallback(() => {
    setAttachments([]);
    setError(null);
    setSuccess(null);
  }, []);

  const addAttachmentFiles = useCallback((files: File[]) => {
    if (!files || files.length === 0) {
      clearAttachments();
      return;
    }

    const newAttachments: AttachmentFile[] = Array.from(files).map((file) => ({
      file,
      name: file.name,
      size: file.size,
    }));

    setAttachments(newAttachments);
    setError(null);
  }, [clearAttachments]);

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const processAttachments = useCallback(async () => {
    if (!pdfDoc) {
      setError('Main PDF is not loaded.');
      return;
    }

    if (attachments.length === 0) {
      setError('Please select at least one file to attach.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Embedding files into PDF...');

    try {
      const files = attachments.map((att) => att.file);

      await addAttachmentsToPDF(
        pdfDoc,
        files,
        (progress) => {
          setLoadingMessage(
            `Attaching ${progress.fileName} (${progress.current}/${progress.total})...`
          );
        }
      );

      const pdfBytes = await pdfDoc.save();
      const arrayBuffer = new ArrayBuffer(pdfBytes.length);
      new Uint8Array(arrayBuffer).set(pdfBytes);
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });

      downloadFile(blob, pdfFile?.name);

      setSuccess(`${attachments.length} file(s) attached successfully.`);
      clearAttachments();
    } catch (err) {
      console.error('Error attaching files:', err);
      setError(
        err instanceof Error
          ? `Failed to attach files: ${err.message}`
          : 'Failed to attach files.'
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [pdfDoc, attachments, pdfFile, clearAttachments]);

  const reset = useCallback(() => {
    clearAttachments();
    resetPDF();
    setError(null);
    setSuccess(null);
    setLoadingMessage(null);
    setIsProcessing(false);
  }, [clearAttachments, resetPDF]);

  return {
    attachments,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,

    loadPDF,
    addAttachmentFiles,
    removeAttachment,
    clearAttachments,
    processAttachments,
    reset,
  };
};
