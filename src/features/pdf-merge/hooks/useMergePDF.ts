'use client';

import { useState, useCallback, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { readFileAsArrayBuffer, saveAndDownloadPDF } from '@/lib/pdf/file-utils';
import { mergePDFsFileMode, mergePDFsPageMode } from '../lib/merge-logic';
import { renderAllPagesAsThumbnails } from '../lib/thumbnail-renderer';
import type { UseMergePDFReturn, PDFFileInfo, PageThumbnailData, MergeMode } from '../types';

export const useMergePDF = (): UseMergePDFReturn => {
  const [pdfFiles, setPdfFiles] = useState<PDFFileInfo[]>([]);
  const [activeMode, setActiveModeState] = useState<MergeMode>('file');
  const [pageThumbnails, setPageThumbnails] = useState<PageThumbnailData[]>([]);
  const [thumbnailImages, setThumbnailImages] = useState<Map<string, string>>(new Map());
  const [pageRanges, setPageRanges] = useState<Map<string, string>>(new Map());

  const [isLoading, setIsLoading] = useState(false);
  const [isRenderingThumbnails, setIsRenderingThumbnails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadPDFs = useCallback(async (files: File[]) => {
    if (!files || files.length === 0) {
      setError('Please select at least one PDF file.');
      return;
    }

    setIsLoading(true);
    setError(null);
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
        setError(
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

  const removePDF = useCallback(
    (id: string) => {
      setPdfFiles((prev) => prev.filter((pdf) => pdf.id !== id));
      setPageThumbnails((prev) => prev.filter((page) => page.fileId !== id));
      setPageRanges((prev) => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
      setThumbnailImages((prev) => {
        const newMap = new Map(prev);
        for (const [key] of prev) {
          if (key.startsWith(`${id}-`)) {
            newMap.delete(key);
          }
        }
        return newMap;
      });
      setError(null);
      setSuccess(null);
    },
    []
  );

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

  const setActiveMode = useCallback(
    async (mode: MergeMode) => {
      if (mode === activeMode) return;

      setActiveModeState(mode);

      if (mode === 'page' && pdfFiles.length > 0 && pageThumbnails.length === 0) {
        await renderPageThumbnails();
      }
    },
    [activeMode, pdfFiles.length, pageThumbnails.length]
  );

  const setPageRange = useCallback((fileId: string, range: string) => {
    setPageRanges((prev) => {
      const newMap = new Map(prev);
      if (range.trim()) {
        newMap.set(fileId, range);
      } else {
        newMap.delete(fileId);
      }
      return newMap;
    });
  }, []);

  const renderPageThumbnails = useCallback(async () => {
    if (pdfFiles.length === 0) return;

    setIsRenderingThumbnails(true);
    setError(null);
    setLoadingMessage('Rendering page previews...');

    try {
      const thumbnailsData: PageThumbnailData[] = [];
      pdfFiles.forEach((pdfInfo) => {
        for (let i = 0; i < pdfInfo.pageCount; i++) {
          const pageId = `${pdfInfo.id}-${i}`;
          thumbnailsData.push({
            id: pageId,
            fileName: pdfInfo.fileName,
            pageIndex: i,
            pageNumber: i + 1,
            fileId: pdfInfo.id,
          });
        }
      });

      setPageThumbnails(thumbnailsData);

      const imagesMap = await renderAllPagesAsThumbnails(pdfFiles, (current, total) => {
        setLoadingMessage(`Rendering page previews: ${current}/${total}`);
      });

      setThumbnailImages(imagesMap);
    } catch (err) {
      console.error('Error rendering thumbnails:', err);
      setError(
        err instanceof Error
          ? `Failed to render thumbnails: ${err.message}`
          : 'Failed to render page thumbnails.'
      );
    } finally {
      setIsRenderingThumbnails(false);
      setLoadingMessage(null);
    }
  }, [pdfFiles]);

  const reorderPages = useCallback((activeId: string, overId: string) => {
    if (activeId === overId) return;

    setPageThumbnails((prev) => {
      const newPages = [...prev];
      const activeIndex = newPages.findIndex((p) => p.id === activeId);
      const overIndex = newPages.findIndex((p) => p.id === overId);

      if (activeIndex === -1 || overIndex === -1) return prev;

      const [moved] = newPages.splice(activeIndex, 1);
      newPages.splice(overIndex, 0, moved);

      return newPages;
    });
  }, []);

  const processMerge = useCallback(async () => {
    if (pdfFiles.length === 0) {
      setError('Please upload at least one PDF file.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Merging PDFs...');

    try {
      let newPdfDoc;

      if (activeMode === 'file') {
        newPdfDoc = await mergePDFsFileMode(pdfFiles, pageRanges);
      } else {
        if (pageThumbnails.length === 0) {
          setError('Please select at least one page to merge.');
          setIsProcessing(false);
          setLoadingMessage(null);
          return;
        }
        newPdfDoc = await mergePDFsPageMode(pdfFiles, pageThumbnails);
      }

      const mergedPdfBytes = await newPdfDoc.save();
      const firstFileName = pdfFiles[0]?.fileName || 'merged';
      saveAndDownloadPDF(mergedPdfBytes, firstFileName);

      setSuccess('PDFs merged successfully!');
    } catch (err) {
      console.error('Merge error:', err);
      setError(
        err instanceof Error
          ? `Failed to merge PDFs: ${err.message}`
          : 'Failed to merge PDFs. Please check that all files are valid and not password-protected.'
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [pdfFiles, activeMode, pageRanges, pageThumbnails]);

  const reset = useCallback(() => {
    setPdfFiles([]);
    setActiveModeState('file');
    setPageThumbnails([]);
    setThumbnailImages(new Map());
    setPageRanges(new Map());
    setError(null);
    setSuccess(null);
    setLoadingMessage(null);
    setIsLoading(false);
    setIsRenderingThumbnails(false);
    setIsProcessing(false);
  }, []);

  useEffect(() => {
    if (activeMode === 'page' && pdfFiles.length > 0 && pageThumbnails.length === 0 && !isRenderingThumbnails) {
      renderPageThumbnails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMode, pdfFiles.length, pageThumbnails.length, isRenderingThumbnails]);

  return {
    pdfFiles,
    activeMode,
    pageThumbnails,
    thumbnailImages,
    isLoading,
    isRenderingThumbnails,
    isProcessing,
    loadingMessage,
    error,
    success,
    pageRanges,
    loadPDFs,
    removePDF,
    reorderFiles,
    setActiveMode,
    setPageRange,
    renderPageThumbnails,
    reorderPages,
    processMerge,
    reset,
  };
};

