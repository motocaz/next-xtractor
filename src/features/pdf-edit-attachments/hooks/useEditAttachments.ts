'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePDFProcessor } from '@/hooks/usePDFProcessor';
import {
  getAttachmentsFromPDF,
  editAttachmentsInPDF,
} from '../lib/edit-attachments-logic';
import { downloadFile } from '@/lib/pdf/file-utils';
import type { UseEditAttachmentsReturn, AttachmentInfo } from '../types';

export const useEditAttachments = (): UseEditAttachmentsReturn => {
  const [attachments, setAttachments] = useState<AttachmentInfo[]>([]);
  const [attachmentsToRemove, setAttachmentsToRemove] = useState<Set<number>>(
    new Set()
  );
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);

  const {
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfDoc,
    pdfFile,
    isLoadingPDF,
    pdfError,
    loadPDF: loadPDFBase,
    resetPDF,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
    resetProcessing,
  } = usePDFProcessor();

  useEffect(() => {
    if (pdfFile && pdfDoc && !isLoadingPDF && !pdfError) {
      loadAttachments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfFile, pdfDoc, isLoadingPDF, pdfError]);

  const loadPDF = useCallback(
    async (file: File) => {
      setAttachments([]);
      setAttachmentsToRemove(new Set());
      await loadPDFBase(file);
    },
    [loadPDFBase]
  );

  const loadAttachments = useCallback(async () => {
    if (!pdfFile) {
      return;
    }

    setIsLoadingAttachments(true);
    setError(null);
    setLoadingMessage('Loading attachments...');

    try {
      const loadedAttachments = await getAttachmentsFromPDF(pdfFile);
      setAttachments(loadedAttachments);
      setAttachmentsToRemove(new Set());
    } catch (err) {
      console.error('Error loading attachments:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load attachments from PDF.'
      );
    } finally {
      setIsLoadingAttachments(false);
      setLoadingMessage(null);
    }
  }, [pdfFile, setError, setLoadingMessage]);

  const toggleAttachmentRemoval = useCallback((index: number) => {
    setAttachmentsToRemove((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const toggleAllAttachments = useCallback(() => {
    if (attachments.length === 0) {
      return;
    }

    const allSelected = attachments.every((attachment) =>
      attachmentsToRemove.has(attachment.index)
    );

    if (allSelected) {
      setAttachmentsToRemove(new Set());
    } else {
      const allIndices = new Set(attachments.map((att) => att.index));
      setAttachmentsToRemove(allIndices);
    }
  }, [attachments, attachmentsToRemove]);

  const processAndSave = useCallback(async () => {
    if (!pdfFile) {
      setError('Please upload a PDF file first.');
      return;
    }

    if (attachmentsToRemove.size === 0) {
      setError('Please select at least one attachment to remove.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Processing attachments...');

    try {
      const indicesToRemove = Array.from(attachmentsToRemove);
      const blob = await editAttachmentsInPDF(pdfFile, indicesToRemove);

      setLoadingMessage('Preparing download...');
      const now = new Date().toISOString();
      downloadFile(blob, undefined, `${now}_${pdfFile.name}`);

      setSuccess('Attachments updated successfully!');
      setAttachmentsToRemove(new Set());
    } catch (err) {
      console.error('Error editing attachments:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to edit attachments. Please try again.'
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfFile,
    attachmentsToRemove,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
  ]);

  const reset = useCallback(() => {
    setAttachments([]);
    setAttachmentsToRemove(new Set());
    setIsLoadingAttachments(false);
    resetProcessing();
    resetPDF();
  }, [resetProcessing, resetPDF]);

  return {
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    isProcessing,
    loadingMessage,
    error,
    success,
    attachments,
    attachmentsToRemove,
    isLoadingAttachments,
    loadPDF,
    loadAttachments,
    toggleAttachmentRemoval,
    toggleAllAttachments,
    processAndSave,
    reset,
  };
};

