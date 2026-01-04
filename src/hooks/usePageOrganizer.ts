'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePDFProcessor } from './usePDFProcessor';
import { processOrganizedPages, buildPageOrder, type PageThumbnailData } from '@/lib/pdf/organize-pages-utils';
import { renderAllPagesAsThumbnails, type PageThumbnail } from '@/lib/pdf/thumbnail-renderer';
import { saveAndDownloadPDF } from '@/lib/pdf/file-utils';
import type { UsePageOrganizerReturn, UsePageOrganizerWithDuplicateReturn } from '@/types/pdf-organize';

interface UsePageOrganizerOptions {
  allowDuplicate?: boolean;
}

export const usePageOrganizer = (
  options: UsePageOrganizerOptions = {}
): UsePageOrganizerReturn | UsePageOrganizerWithDuplicateReturn => {
  const { allowDuplicate = false } = options;
  const [pages, setPages] = useState<PageThumbnailData[]>([]);
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
  const [isLoadingThumbnails, setIsLoadingThumbnails] = useState(false);

  const {
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfDoc,
    pdfFile,
    isLoadingPDF,
    pdfError,
    totalPages,
    loadPDF: loadPDFBase,
    resetPDF,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
    resetProcessing,
  } = usePDFProcessor();

  useEffect(() => {
    if (pdfDoc && !isLoadingPDF && !pdfError) {
      const total = pdfDoc.getPageCount();
      const initialPages: PageThumbnailData[] = Array.from({ length: total }, (_, i) => ({
        id: `page-${i}-${Date.now()}`,
        originalPageIndex: i,
        displayNumber: i + 1,
      }));
      setPages(initialPages);
      setThumbnails([]);
    }
  }, [pdfDoc, isLoadingPDF, pdfError]);

  useEffect(() => {
    if (pages.length > 0 && pdfFile && thumbnails.length === 0 && !isLoadingThumbnails) {
      const loadThumbnails = async () => {
        setIsLoadingThumbnails(true);
        try {
          const arrayBuffer = await pdfFile.arrayBuffer();
          const renderedThumbnails = await renderAllPagesAsThumbnails(
            arrayBuffer,
            (current, total) => {
              setLoadingMessage(`Rendering thumbnails: ${current}/${total}`);
            }
          );
          setThumbnails(renderedThumbnails);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages.length, pdfFile]);

  const loadPDF = useCallback(
    async (file: File) => {
      await loadPDFBase(file);
    },
    [loadPDFBase]
  );

  const reorderPages = useCallback((activeId: string, overId: string) => {
    if (activeId === overId) return;

    setPages((prevPages) => {
      const newPages = [...prevPages];
      const activeIndex = newPages.findIndex((p) => p.id === activeId);
      const overIndex = newPages.findIndex((p) => p.id === overId);

      if (activeIndex === -1 || overIndex === -1) return prevPages;

      const [movedPage] = newPages.splice(activeIndex, 1);
      newPages.splice(overIndex, 0, movedPage);

      return newPages.map((page, index) => ({
        ...page,
        displayNumber: index + 1,
      }));
    });
  }, []);

  const duplicatePage = useCallback((pageId: string) => {
    setPages((prevPages) => {
      const pageIndex = prevPages.findIndex((p) => p.id === pageId);
      if (pageIndex === -1) return prevPages;

      const pageToDuplicate = prevPages[pageIndex];
      const newPage: PageThumbnailData = {
        id: `page-${pageToDuplicate.originalPageIndex}-${Date.now()}`,
        originalPageIndex: pageToDuplicate.originalPageIndex,
        displayNumber: pageIndex + 2,
      };

      const newPages = [...prevPages];
      newPages.splice(pageIndex + 1, 0, newPage);

      return newPages.map((page, index) => ({
        ...page,
        displayNumber: index + 1,
      }));
    });
  }, []);

  const deletePage = useCallback(
    (pageId: string) => {
      if (pages.length <= 1) {
        setError('You cannot delete the last page of the document.');
        return;
      }

      setPages((prevPages) => {
        const newPages = prevPages.filter((p) => p.id !== pageId);
        return newPages.map((page, index) => ({
          ...page,
          displayNumber: index + 1,
        }));
      });
    },
    [pages.length, setError]
  );

  const processAndSave = useCallback(async () => {
    if (!pdfFile) {
      setError('Please upload a PDF file first.');
      return;
    }

    if (!pdfDoc) {
      setError('PDF document is not loaded. Please try uploading again.');
      return;
    }

    if (pages.length === 0) {
      setError('No pages to process.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Building new PDF...');

    try {
      const pageIndices = buildPageOrder(pages);
      const pdfBytes = await processOrganizedPages(pdfDoc, pageIndices);

      setLoadingMessage('Preparing download...');
      saveAndDownloadPDF(pdfBytes, pdfFile.name);

      setSuccess('PDF organized successfully! Your download has started.');
    } catch (err) {
      console.error('Error processing PDF:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Could not process PDF. Please try again.'
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [pdfFile, pdfDoc, pages, setIsProcessing, setError, setSuccess, setLoadingMessage]);

  const reset = useCallback(() => {
    setPages([]);
    setThumbnails([]);
    setIsLoadingThumbnails(false);
    resetProcessing();
    resetPDF();
  }, [resetProcessing, resetPDF]);

  const baseReturn: UsePageOrganizerReturn = {
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    isProcessing,
    loadingMessage,
    error,
    success,
    pages,
    thumbnails,
    isLoadingThumbnails,
    loadPDF,
    reorderPages,
    deletePage,
    processAndSave,
    reset,
  };

  if (allowDuplicate) {
    return {
      ...baseReturn,
      duplicatePage,
    } as UsePageOrganizerWithDuplicateReturn;
  }

  return baseReturn;
};

