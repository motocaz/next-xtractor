"use client";

import { useState, useCallback, useEffect } from "react";
import { saveAndDownloadPDF } from "@/lib/pdf/file-utils";
import { mergePDFsFileMode, mergePDFsPageMode } from "../lib/merge-logic";
import { renderAllPagesAsThumbnails } from "../lib/thumbnail-renderer";
import { useMultiPDFLoader } from "@/hooks/useMultiPDFLoader";
import type {
  UseMergePDFReturn,
  MergePageThumbnailData,
  MergeMode,
} from "../types";

export const useMergePDF = (): UseMergePDFReturn => {
  const [activeMode, setActiveModeState] = useState<MergeMode>("file");
  const [pageThumbnails, setPageThumbnails] = useState<
    MergePageThumbnailData[]
  >([]);
  const [thumbnailImages, setThumbnailImages] = useState<Map<string, string>>(
    new Map(),
  );
  const [pageRanges, setPageRanges] = useState<Map<string, string>>(new Map());

  const [isRenderingThumbnails, setIsRenderingThumbnails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLoadingMessage, setProcessingLoadingMessage] = useState<
    string | null
  >(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    pdfFiles,
    isLoading,
    loadingMessage,
    error,
    loadPDFs: loaderLoadPDFs,
    removePDF: loaderRemovePDF,
    reorderFiles,
    reset: loaderReset,
  } = useMultiPDFLoader({
    onEncryptedFiles: "error",
  });

  const loadPDFs = useCallback(
    async (files: File[]) => {
      setSuccess(null);
      await loaderLoadPDFs(files);
    },
    [loaderLoadPDFs],
  );

  const removePDF = useCallback(
    (id: string) => {
      loaderRemovePDF(id);
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
      setSuccess(null);
    },
    [loaderRemovePDF],
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
    setProcessingError(null);
    setProcessingLoadingMessage("Rendering page previews...");

    try {
      const thumbnailsData: MergePageThumbnailData[] = [];
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

      const imagesMap = await renderAllPagesAsThumbnails(
        pdfFiles,
        (current, total) => {
          setProcessingLoadingMessage(
            `Rendering page previews: ${current}/${total}`,
          );
        },
      );

      setThumbnailImages(imagesMap);
    } catch (err) {
      console.error("Error rendering thumbnails:", err);
      setProcessingError(
        err instanceof Error
          ? `Failed to render thumbnails: ${err.message}`
          : "Failed to render page thumbnails.",
      );
    } finally {
      setIsRenderingThumbnails(false);
      setProcessingLoadingMessage(null);
    }
  }, [pdfFiles]);

  const setActiveMode = useCallback(
    async (mode: MergeMode) => {
      if (mode === activeMode) return;

      setActiveModeState(mode);

      if (
        mode === "page" &&
        pdfFiles.length > 0 &&
        pageThumbnails.length === 0
      ) {
        await renderPageThumbnails();
      }
    },
    [activeMode, pdfFiles.length, pageThumbnails.length, renderPageThumbnails],
  );

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
      setProcessingError("Please upload at least one PDF file.");
      return;
    }

    setIsProcessing(true);
    setProcessingError(null);
    setSuccess(null);
    setProcessingLoadingMessage("Merging PDFs...");

    try {
      let newPdfDoc;

      if (activeMode === "file") {
        newPdfDoc = await mergePDFsFileMode(pdfFiles, pageRanges);
      } else {
        if (pageThumbnails.length === 0) {
          setProcessingError("Please select at least one page to merge.");
          setIsProcessing(false);
          setProcessingLoadingMessage(null);
          return;
        }
        newPdfDoc = await mergePDFsPageMode(pdfFiles, pageThumbnails);
      }

      const mergedPdfBytes = await newPdfDoc.save();
      const firstFileName = pdfFiles[0]?.fileName || "merged";
      saveAndDownloadPDF(mergedPdfBytes, firstFileName);

      setSuccess("PDFs merged successfully!");
    } catch (err) {
      console.error("Merge error:", err);
      setProcessingError(
        err instanceof Error
          ? `Failed to merge PDFs: ${err.message}`
          : "Failed to merge PDFs. Please check that all files are valid and not password-protected.",
      );
    } finally {
      setIsProcessing(false);
      setProcessingLoadingMessage(null);
    }
  }, [pdfFiles, activeMode, pageRanges, pageThumbnails]);

  const reset = useCallback(() => {
    loaderReset();
    setActiveModeState("file");
    setPageThumbnails([]);
    setThumbnailImages(new Map());
    setPageRanges(new Map());
    setProcessingError(null);
    setSuccess(null);
    setProcessingLoadingMessage(null);
    setIsRenderingThumbnails(false);
    setIsProcessing(false);
  }, [loaderReset]);

  useEffect(() => {
    if (
      activeMode === "page" &&
      pdfFiles.length > 0 &&
      pageThumbnails.length === 0 &&
      !isRenderingThumbnails
    ) {
      renderPageThumbnails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeMode,
    pdfFiles.length,
    pageThumbnails.length,
    isRenderingThumbnails,
  ]);

  const combinedLoading = isLoading || isRenderingThumbnails || isProcessing;
  const combinedLoadingMessage = loadingMessage || processingLoadingMessage;
  const combinedError = error || processingError;

  return {
    pdfFiles,
    activeMode,
    pageThumbnails,
    thumbnailImages,
    isLoading: combinedLoading,
    isRenderingThumbnails,
    isProcessing,
    loadingMessage: combinedLoadingMessage,
    error: combinedError,
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
