'use client';

import { useState, useCallback } from 'react';
import { usePDFProcessor } from '@/hooks/usePDFProcessor';
import { parsePageRanges } from '@/lib/pdf/file-utils';
import { saveAndDownloadPDF } from '@/lib/pdf/file-utils';
import { removeAnnotationsFromDoc } from '../lib/remove-annotations-logic';
import type {
  UseRemoveAnnotationsReturn,
  AnnotationType,
  PageScope,
} from '../types';

const ALL_ANNOTATION_TYPES: AnnotationType[] = [
  'Highlight',
  'StrikeOut',
  'Underline',
  'Ink',
  'Polygon',
  'Square',
  'Circle',
  'Line',
  'PolyLine',
  'Link',
  'Text',
  'FreeText',
  'Popup',
  'Squiggly',
  'Stamp',
  'Caret',
  'FileAttachment',
];

export const useRemoveAnnotations = (): UseRemoveAnnotationsReturn => {
  const [pageScope, setPageScope] = useState<PageScope>('all');
  const [pageRange, setPageRange] = useState<string>('');
  const [selectedTypes, setSelectedTypes] = useState<Set<AnnotationType>>(
    new Set()
  );

  const {
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfDoc,
    pdfFile,
    isLoadingPDF,
    pdfError,
    loadPDF: baseLoadPDF,
    resetPDF,
    totalPages,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
    resetProcessing,
  } = usePDFProcessor();

  const loadPDF = useCallback(
    async (file: File) => {
      setPageScope('all');
      setPageRange('');
      setSelectedTypes(new Set());
      await baseLoadPDF(file);
    },
    [baseLoadPDF]
  );

  const toggleAnnotationType = useCallback((type: AnnotationType) => {
    setSelectedTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  }, []);

  const selectAllTypes = useCallback(() => {
    setSelectedTypes(new Set(ALL_ANNOTATION_TYPES));
  }, []);

  const deselectAllTypes = useCallback(() => {
    setSelectedTypes(new Set());
  }, []);

  const removeAnnotations = useCallback(async () => {
    if (!pdfFile) {
      setError('Please upload a PDF file first.');
      return;
    }

    if (!pdfDoc) {
      setError('PDF document is not loaded. Please try uploading again.');
      return;
    }

    if (selectedTypes.size === 0) {
      setError('Please select at least one annotation type to remove.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Removing annotations...');

    try {
      let targetPageIndices: number[];

      if (pageScope === 'all') {
        targetPageIndices = Array.from({ length: totalPages }, (_, i) => i);
      } else {
        if (!pageRange || pageRange.trim() === '') {
          setError('Please enter a page range.');
          setIsProcessing(false);
          setLoadingMessage(null);
          return;
        }

        targetPageIndices = parsePageRanges(pageRange, totalPages);

        if (targetPageIndices.length === 0) {
          setError('No valid pages were selected. Please check your page range.');
          setIsProcessing(false);
          setLoadingMessage(null);
          return;
        }
      }

      const annotationTypesSet = new Set<string>(
        Array.from(selectedTypes) as string[]
      );

      removeAnnotationsFromDoc(pdfDoc, targetPageIndices, annotationTypesSet);

      setLoadingMessage('Saving PDF...');
      const pdfBytes = await pdfDoc.save();
      saveAndDownloadPDF(pdfBytes, pdfFile.name);

      setSuccess('Annotations removed successfully! Your download has started.');
    } catch (err) {
      console.error('Error removing annotations:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Could not remove annotations. Please check your page range and try again.'
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfFile,
    pdfDoc,
    pageScope,
    pageRange,
    selectedTypes,
    totalPages,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
  ]);

  const reset = useCallback(() => {
    setPageScope('all');
    setPageRange('');
    setSelectedTypes(new Set());
    resetProcessing();
    resetPDF();
  }, [resetProcessing, resetPDF]);

  return {
    pageScope,
    pageRange,
    selectedTypes,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    setPageScope,
    setPageRange,
    toggleAnnotationType,
    selectAllTypes,
    deselectAllTypes,
    removeAnnotations,
    loadPDF,
    reset,
  };
};

