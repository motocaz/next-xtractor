'use client';

import { useState, useCallback, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { usePDFProcessor } from '@/hooks/usePDFProcessor';
import { renderAllPagesAsThumbnails } from '@/lib/pdf/thumbnail-renderer';
import { readFileAsArrayBuffer } from '@/lib/pdf/file-utils';
import { applyRotationsToPDF } from '../lib/rotate-pages-logic';
import type { UseRotatePagesReturn, PageRotationState } from '../types';

export const useRotatePages = (): UseRotatePagesReturn => {
  const [rotations, setRotations] = useState<PageRotationState>(new Map());
  const [thumbnails, setThumbnails] = useState<Array<{ pageNum: number; imageUrl: string }>>([]);
  const [isLoadingThumbnails, setIsLoadingThumbnails] = useState(false);

  const {
    pdfDoc,
    pdfFile,
    isLoadingPDF,
    pdfError,
    isProcessing,
    loadingMessage,
    error,
    success,
    totalPages,
    loadPDF: loadPDFBase,
    resetPDF,
    setIsProcessing,
    setLoadingMessage,
    setError,
    setSuccess,
    resetProcessing,
  } = usePDFProcessor(false);

  useEffect(() => {
    if (pdfFile && pdfDoc && thumbnails.length === 0 && !isLoadingThumbnails) {
      const loadThumbnails = async () => {
        setIsLoadingThumbnails(true);
        setLoadingMessage('Rendering page thumbnails...');
        try {
          const arrayBuffer = await readFileAsArrayBuffer(pdfFile);
          const renderedThumbnails = await renderAllPagesAsThumbnails(
            arrayBuffer,
            (current, total) => {
              setLoadingMessage(`Rendering thumbnails: ${current}/${total}`);
            }
          );
          setThumbnails(renderedThumbnails);
          const initialRotations = new Map<number, number>();
          for (let i = 0; i < totalPages; i++) {
            initialRotations.set(i, 0);
          }
          setRotations(initialRotations);
        } catch (err) {
          console.error('Error loading thumbnails:', err);
          setError('Failed to load page thumbnails.');
        } finally {
          setIsLoadingThumbnails(false);
          setLoadingMessage(null);
        }
      };

      loadThumbnails();
    }
  }, [pdfFile, pdfDoc, totalPages, thumbnails.length, isLoadingThumbnails, setLoadingMessage, setError]);

  useEffect(() => {
    if (!pdfFile) {
      setThumbnails([]);
      setRotations(new Map());
    }
  }, [pdfFile]);

  const loadPDF = useCallback(
    async (file: File) => {
      setThumbnails([]);
      setRotations(new Map());
      await loadPDFBase(file);
    },
    [loadPDFBase]
  );

  const rotatePage = useCallback((pageIndex: number, delta: number) => {
    setRotations((prev) => {
      const newRotations = new Map(prev);
      const currentRotation = newRotations.get(pageIndex) || 0;
      const newRotation = (currentRotation + delta + 360) % 360;
      newRotations.set(pageIndex, newRotation);
      return newRotations;
    });
  }, []);

  const rotateAll = useCallback((delta: number) => {
    setRotations((prev) => {
      const newRotations = new Map<number, number>();
      for (let i = 0; i < totalPages; i++) {
        const currentRotation = prev.get(i) || 0;
        const newRotation = (currentRotation + delta + 360) % 360;
        newRotations.set(i, newRotation);
      }
      return newRotations;
    });
  }, [totalPages]);

  const resetRotations = useCallback(() => {
    const newRotations = new Map<number, number>();
    for (let i = 0; i < totalPages; i++) {
      newRotations.set(i, 0);
    }
    setRotations(newRotations);
  }, [totalPages]);

  const applyRotations = useCallback(async () => {
    if (!pdfDoc || !pdfFile) {
      setError('Please upload a PDF file first.');
      return;
    }

    const hasRotations = Array.from(rotations.values()).some((rotation) => rotation !== 0);
    if (!hasRotations) {
      setError('No rotations to apply. Please rotate at least one page.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Applying rotations...');

    try {
      const arrayBuffer = await readFileAsArrayBuffer(pdfFile);
      const pdfDocCopy = await PDFDocument.load(arrayBuffer);

      await applyRotationsToPDF(pdfDocCopy, rotations, pdfFile.name);
      setSuccess('Rotations applied successfully! Download started.');
    } catch (err) {
      console.error('Error applying rotations:', err);
      setError(
        err instanceof Error
          ? `An error occurred while applying rotations: ${err.message}`
          : 'An error occurred while applying rotations. Please check your file.'
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [pdfDoc, pdfFile, rotations, setIsProcessing, setError, setSuccess, setLoadingMessage]);

  const reset = useCallback(() => {
    resetPDF();
    resetProcessing();
    setThumbnails([]);
    setRotations(new Map());
  }, [resetPDF, resetProcessing]);

  const loadingMessageCombined = loadingMessage || (isLoadingThumbnails ? 'Rendering thumbnails...' : null);

  return {
    pdfFile,
    pdfDoc,
    totalPages,
    isLoadingPDF,
    pdfError,
    isProcessing,
    isLoadingThumbnails,
    loadingMessage: loadingMessageCombined,
    error,
    success,
    thumbnails,
    rotations,
    loadPDF,
    rotatePage,
    rotateAll,
    resetRotations,
    applyRotations,
    reset,
  };
};

