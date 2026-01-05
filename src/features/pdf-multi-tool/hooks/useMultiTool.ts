'use client';

import { useState, useCallback, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useMultiPDFLoader } from '@/hooks/useMultiPDFLoader';
import { useMultiToolHistory } from './useMultiToolHistory';
import { renderMultiplePDFsAsThumbnails } from '../lib/thumbnail-renderer';
import {
  downloadSelectedPages,
  downloadAllPages,
} from '../lib/multi-tool-utils';
import { readFileAsArrayBuffer } from '@/lib/pdf/file-utils';
import type { MultiToolPageData, UseMultiToolReturn } from '../types';

export const useMultiTool = (): UseMultiToolReturn => {
  const [pages, setPages] = useState<MultiToolPageData[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [splitMarkers, setSplitMarkers] = useState<Set<string>>(new Set());
  const [isRendering, setIsRendering] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const renderCancelledRef = useRef(false);

  const {
    pdfFiles,
    isLoading,
    loadingMessage: loaderLoadingMessage,
    error: loaderError,
    loadPDFs: loadPDFsBase,
    reset: resetLoader,
  } = useMultiPDFLoader({
    onEncryptedFiles: 'error',
    allowEncrypted: false,
  });

  const history = useMultiToolHistory();

  const createSnapshot = useCallback((): {
    pages: Array<{
      id: string;
      pdfIndex: number;
      pageIndex: number;
      originalPageIndex: number;
      rotation: number;
      visualRotation: number;
      fileName: string;
      isBlankPage: boolean;
    }>;
    selectedPages: string[];
    splitMarkers: string[];
  } => {
    return {
      pages: pages.map((p) => ({
        id: p.id,
        pdfIndex: p.pdfIndex,
        pageIndex: p.pageIndex,
        originalPageIndex: p.originalPageIndex,
        rotation: p.rotation,
        visualRotation: p.visualRotation,
        fileName: p.fileName,
        isBlankPage: p.isBlankPage,
      })),
      selectedPages: Array.from(selectedPages),
      splitMarkers: Array.from(splitMarkers),
    };
  }, [pages, selectedPages, splitMarkers]);

  const restoreSnapshot = useCallback(
    (snapshot: {
      pages: Array<{
        id: string;
        pdfIndex: number;
        pageIndex: number;
        originalPageIndex: number;
        rotation: number;
        visualRotation: number;
        fileName: string;
        isBlankPage: boolean;
      }>;
      selectedPages: string[];
      splitMarkers: string[];
    }) => {
      const restoredPages: MultiToolPageData[] = snapshot.pages.map((p) => {
        const pdfFile = pdfFiles[p.pdfIndex];
        if (!pdfFile && !p.isBlankPage) {
          console.warn(`PDF file at index ${p.pdfIndex} not found when restoring snapshot`);
        }
        return {
          id: p.id,
          pdfIndex: p.pdfIndex,
          pageIndex: p.pageIndex,
          originalPageIndex: p.originalPageIndex,
          rotation: p.rotation,
          visualRotation: p.visualRotation,
          pdfDoc: pdfFile?.pdfDoc || ({} as PDFDocument), 
          fileName: p.fileName,
          thumbnailUrl: undefined,
          isBlankPage: p.isBlankPage,
        };
      }).filter((p) => p.pdfDoc || p.isBlankPage);

      setPages(restoredPages);
      setSelectedPages(new Set(snapshot.selectedPages));
      setSplitMarkers(new Set(snapshot.splitMarkers));
    },
    [pdfFiles]
  );

  const saveState = useCallback(() => {
    const snapshot = createSnapshot();
    history.saveState(snapshot);
  }, [createSnapshot, history]);

  const loadPDFs = useCallback(
    async (files: File[]) => {
      if (isRendering) {
        setError('Pages are still being rendered. Please wait...');
        return;
      }

      setError(null);
      setSuccess(null);
      renderCancelledRef.current = false;

      setIsRendering(true);
      setLoadingMessage('Loading PDFs...');

      try {
        const pdfBuffers: ArrayBuffer[] = [];
        const pdfDocs: PDFDocument[] = [];
        const fileNames: string[] = [];

        for (const pdfFile of pdfFiles) {
          const buffer = await readFileAsArrayBuffer(pdfFile.file);
          pdfBuffers.push(buffer);
          pdfDocs.push(pdfFile.pdfDoc);
          fileNames.push(pdfFile.fileName);
        }

        for (const file of files) {
          const bufferForPdfLib = await readFileAsArrayBuffer(file);
          const pdfDoc = await PDFDocument.load(bufferForPdfLib);
          pdfDocs.push(pdfDoc);
          fileNames.push(file.name);

          const bufferCopy = bufferForPdfLib.slice(0);
          pdfBuffers.push(bufferCopy);
        }

        await loadPDFsBase(files);

        setLoadingMessage('Rendering page thumbnails...');

        const thumbnails = await renderMultiplePDFsAsThumbnails(
          pdfBuffers,
          (current, total) => {
            if (renderCancelledRef.current) return;
            setLoadingMessage(`Rendering pages... ${current} of ${total}`);
          }
        );

        if (renderCancelledRef.current) {
          return;
        }

        const newPages: MultiToolPageData[] = [];
        let pageIdCounter = pages.length;
        const startPdfIndex = pdfFiles.length;

        for (let pdfIndex = startPdfIndex; pdfIndex < pdfDocs.length; pdfIndex++) {
          const pdfDoc = pdfDocs[pdfIndex];
          const numPages = pdfDoc.getPageCount();
          const fileName = fileNames[pdfIndex];

          for (let pageIndex = 0; pageIndex < numPages; pageIndex++) {
            const thumbnail = thumbnails.find(
              (t) => t.pdfIndex === pdfIndex && t.pageIndex === pageIndex
            );

            newPages.push({
              id: `page-${pageIdCounter++}-${Date.now()}`,
              pdfIndex,
              pageIndex,
              originalPageIndex: pageIndex,
              rotation: 0,
              visualRotation: 0,
              pdfDoc,
              fileName,
              thumbnailUrl: thumbnail?.imageUrl,
              isBlankPage: false,
            });
          }
        }

        setPages((prev) => [...prev, ...newPages]);
        saveState();
      } catch (err) {
        console.error('Error loading PDFs:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load PDFs. They may be corrupted.'
        );
      } finally {
        setIsRendering(false);
        setLoadingMessage(null);
      }
    },
    [
      isRendering,
      loadPDFsBase,
      pdfFiles,
      pages.length,
      saveState,
    ]
  );

  const insertPDFAfter = useCallback(
    async (pageId: string, file: File) => {
      if (isRendering) {
        setError('Pages are still being rendered. Please wait...');
        return;
      }

      try {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const numPages = pdfDoc.getPageCount();

        const insertIndex = pages.findIndex((p) => p.id === pageId);
        if (insertIndex === -1) {
          setError('Page not found');
          return;
        }

        const thumbnails = await renderMultiplePDFsAsThumbnails([arrayBuffer]);

        const newPages: MultiToolPageData[] = [];
        let pageIdCounter = pages.length;

        for (let i = 0; i < numPages; i++) {
          const thumbnail = thumbnails.find((t) => t.pageIndex === i);
          newPages.push({
            id: `page-${pageIdCounter++}-${Date.now()}`,
            pdfIndex: -1,
            pageIndex: i,
            originalPageIndex: i,
            rotation: 0,
            visualRotation: 0,
            pdfDoc,
            fileName: file.name,
            thumbnailUrl: thumbnail?.imageUrl,
            isBlankPage: false,
          });
        }

        setPages((prev) => {
          const newPagesArray = [...prev];
          newPagesArray.splice(insertIndex + 1, 0, ...newPages);
          return newPagesArray;
        });

        saveState();
      } catch (err) {
        console.error('Error inserting PDF:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to insert PDF. The file may be corrupted.'
        );
      }
    },
    [isRendering, pages, saveState]
  );

  const toggleSelectPage = useCallback((pageId: string) => {
    setSelectedPages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pageId)) {
        newSet.delete(pageId);
      } else {
        newSet.add(pageId);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedPages(new Set(pages.map((p) => p.id)));
  }, [pages]);

  const deselectAll = useCallback(() => {
    setSelectedPages(new Set());
  }, []);

  const rotatePage = useCallback(
    (pageId: string, delta: number) => {
      saveState();
      setPages((prev) =>
        prev.map((page) => {
          if (page.id === pageId) {
            return {
              ...page,
              visualRotation: (page.visualRotation + delta + 360) % 360,
              rotation: (page.rotation + delta + 360) % 360,
            };
          }
          return page;
        })
      );
    },
    [saveState]
  );

  const duplicatePage = useCallback(
    (pageId: string) => {
      saveState();
      setPages((prev) => {
        const pageIndex = prev.findIndex((p) => p.id === pageId);
        if (pageIndex === -1) return prev;

        const pageToDuplicate = prev[pageIndex];
        const newPage: MultiToolPageData = {
          ...pageToDuplicate,
          id: `page-${Date.now()}-${Math.random()}`,
        };

        const newPages = [...prev];
        newPages.splice(pageIndex + 1, 0, newPage);
        return newPages;
      });
    },
    [saveState]
  );

  const deletePage = useCallback(
    (pageId: string) => {
      saveState();
      setPages((prev) => {
        const newPages = prev.filter((p) => p.id !== pageId);
        if (newPages.length === 0) {
          setSelectedPages(new Set());
          setSplitMarkers(new Set());
          setIsRendering(false);
          setIsProcessing(false);
          setLoadingMessage(null);
          setError(null);
          setSuccess(null);
          resetLoader();
          history.clearHistory();
          return [];
        }
        return newPages;
      });
      setSelectedPages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(pageId);
        return newSet;
      });
      setSplitMarkers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(pageId);
        return newSet;
      });
    },
    [saveState, resetLoader, history]
  );

  const addBlankPage = useCallback(() => {
    saveState();
    const newPage: MultiToolPageData = {
      id: `page-blank-${Date.now()}-${Math.random()}`,
      pdfIndex: -1,
      pageIndex: -1,
      originalPageIndex: -1,
      rotation: 0,
      visualRotation: 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pdfDoc: null as any, 
      fileName: '',
      isBlankPage: true,
    };
    setPages((prev) => [...prev, newPage]);
  }, [saveState]);

  const toggleSplitMarker = useCallback((pageId: string) => {
    saveState();
    setSplitMarkers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pageId)) {
        newSet.delete(pageId);
      } else {
        newSet.add(pageId);
      }
      return newSet;
    });
  }, [saveState]);

  const reorderPages = useCallback((activeId: string, overId: string) => {
    if (activeId === overId) return;

    saveState();
    setPages((prev) => {
      const oldIndex = prev.findIndex((p) => p.id === activeId);
      const newIndex = prev.findIndex((p) => p.id === overId);

      if (oldIndex === -1 || newIndex === -1) return prev;

      const newPages = [...prev];
      const [moved] = newPages.splice(oldIndex, 1);
      newPages.splice(newIndex, 0, moved);

      return newPages;
    });
  }, [saveState]);

  const bulkRotate = useCallback(
    (delta: number) => {
      if (selectedPages.size === 0) {
        setError('Please select pages to rotate.');
        return;
      }

      saveState();
      setPages((prev) =>
        prev.map((page) => {
          if (selectedPages.has(page.id)) {
            return {
              ...page,
              visualRotation: (page.visualRotation + delta + 360) % 360,
              rotation: (page.rotation + delta + 360) % 360,
            };
          }
          return page;
        })
      );
    },
    [selectedPages, saveState]
  );

  const bulkDelete = useCallback(() => {
    if (selectedPages.size === 0) {
      setError('Please select pages to delete.');
      return;
    }

    saveState();
    setPages((prev) => {
      const newPages = prev.filter((p) => !selectedPages.has(p.id));
      if (newPages.length === 0) {
        setSelectedPages(new Set());
        setSplitMarkers(new Set());
        setIsRendering(false);
        setIsProcessing(false);
        setLoadingMessage(null);
        setError(null);
        setSuccess(null);
        resetLoader();
        history.clearHistory();
        return [];
      }
      return newPages;
    });
    setSelectedPages(new Set());
    setSplitMarkers((prev) => {
      const newSet = new Set(prev);
      selectedPages.forEach((id) => newSet.delete(id));
      return newSet;
    });
  }, [selectedPages, saveState, resetLoader, history]);

  const bulkDuplicate = useCallback(() => {
    if (selectedPages.size === 0) {
      setError('Please select pages to duplicate.');
      return;
    }

    saveState();
    setPages((prev) => {
      const newPages = [...prev];
      const selectedIndices = prev
        .map((p, i) => (selectedPages.has(p.id) ? i : -1))
        .filter((i) => i !== -1)
        .sort((a, b) => b - a); 

      for (const index of selectedIndices) {
        const pageToDuplicate = newPages[index];
        const newPage: MultiToolPageData = {
          ...pageToDuplicate,
          id: `page-${Date.now()}-${Math.random()}`,
        };
        newPages.splice(index + 1, 0, newPage);
      }

      return newPages;
    });
    setSelectedPages(new Set());
  }, [selectedPages, saveState]);

  const bulkSplit = useCallback(() => {
    if (selectedPages.size === 0) {
      setError('Please select pages to mark for splitting.');
      return;
    }

    saveState();
    setSplitMarkers((prev) => {
      const newSet = new Set(prev);
      selectedPages.forEach((id) => {
        if (!newSet.has(id)) {
          newSet.add(id);
        }
      });
      return newSet;
    });
    setSelectedPages(new Set());
  }, [selectedPages, saveState]);

  const downloadSelected = useCallback(async () => {
    if (selectedPages.size === 0) {
      setError('Please select pages to download.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Creating PDF...');

    try {
      const originalFileName = pages[0]?.fileName;
      await downloadSelectedPages(pages, selectedPages, originalFileName);
      setSuccess('Download started successfully!');
    } catch (err) {
      console.error('Error downloading selected pages:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to create PDF.'
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [pages, selectedPages]);

  const downloadAll = useCallback(async () => {
    if (pages.length === 0) {
      setError('Please upload PDFs first.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Creating PDF...');

    try {
      const originalFileName = pages[0]?.fileName;
      await downloadAllPages(pages, splitMarkers, originalFileName);
      setSuccess(
        splitMarkers.size > 0
          ? `Downloaded ${Array.from(splitMarkers).length + 1} PDF files in a ZIP archive.`
          : 'Download started successfully!'
      );
    } catch (err) {
      console.error('Error downloading all pages:', err);
      setError(err instanceof Error ? err.message : 'Failed to create PDF.');
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [pages, splitMarkers]);

  const undo = useCallback(() => {
    const snapshot = history.undo();
    if (snapshot) {
      restoreSnapshot(snapshot);
    }
  }, [history, restoreSnapshot]);

  const redo = useCallback(() => {
    const snapshot = history.redo();
    if (snapshot) {
      restoreSnapshot(snapshot);
    }
  }, [history, restoreSnapshot]);

  const reset = useCallback(() => {
    if (isRendering) {
      renderCancelledRef.current = true;
      setTimeout(() => {
        setPages([]);
        setSelectedPages(new Set());
        setSplitMarkers(new Set());
        setIsRendering(false);
        setIsProcessing(false);
        setLoadingMessage(null);
        setError(null);
        setSuccess(null);
        resetLoader();
        history.clearHistory();
        renderCancelledRef.current = false;
      }, 100);
    } else {
      setPages([]);
      setSelectedPages(new Set());
      setSplitMarkers(new Set());
      setIsRendering(false);
      setIsProcessing(false);
      setLoadingMessage(null);
      setError(null);
      setSuccess(null);
      resetLoader();
      history.clearHistory();
    }
  }, [isRendering, resetLoader, history]);

  return {
    pages,
    selectedPages,
    splitMarkers,
    isLoading: isLoading || isRendering,
    isRendering,
    isProcessing,
    loadingMessage: loadingMessage || loaderLoadingMessage,
    error: error || loaderError,
    success,
    pdfFiles: pdfFiles.map((pdf) => ({
      id: pdf.id,
      file: pdf.file,
      pdfDoc: pdf.pdfDoc,
      pageCount: pdf.pageCount,
      fileName: pdf.fileName,
    })),
    loadPDFs,
    insertPDFAfter,
    toggleSelectPage,
    selectAll,
    deselectAll,
    rotatePage,
    duplicatePage,
    deletePage,
    addBlankPage,
    toggleSplitMarker,
    reorderPages,
    bulkRotate,
    bulkDelete,
    bulkDuplicate,
    bulkSplit,
    downloadSelected,
    downloadAll,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    undo,
    redo,
    reset,
  };
};

