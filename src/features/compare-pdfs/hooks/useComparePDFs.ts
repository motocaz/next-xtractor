"use client";

import { useState, useCallback } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { loadPDFWithPDFJS as loadPDFDocument } from "@/lib/pdf/pdfjs-loader";
import { renderPage } from "../lib/pdf-renderer";
import type { UseComparePDFsReturn, ViewMode } from "../types";

export const useComparePDFs = (): UseComparePDFsReturn => {
  const [pdfDoc1, setPdfDoc1] = useState<PDFDocumentProxy | null>(null);
  const [pdfDoc2, setPdfDoc2] = useState<PDFDocumentProxy | null>(null);
  const [pdfFile1, setPdfFile1] = useState<File | null>(null);
  const [pdfFile2, setPdfFile2] = useState<File | null>(null);
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [error1, setError1] = useState<string | null>(null);
  const [error2, setError2] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("overlay");
  const [opacity, setOpacity] = useState(0.5);
  const [isSyncScroll, setIsSyncScroll] = useState(true);

  const createPDFLoader = useCallback(
    (
      setDoc: React.Dispatch<React.SetStateAction<PDFDocumentProxy | null>>,
      setFile: React.Dispatch<React.SetStateAction<File | null>>,
      setLoading: React.Dispatch<React.SetStateAction<boolean>>,
      setError: React.Dispatch<React.SetStateAction<string | null>>,
      pdfLabel: string
    ) => {
      return async (file: File) => {
        if (file?.type !== "application/pdf") {
          setError("Please select a valid PDF file.");
          return;
        }

        setLoading(true);
        setError(null);

        try {
          const doc = await loadPDFDocument(file);
          setDoc(doc);
          setFile(file);
          setCurrentPage(1);
        } catch (err) {
          console.error(`Error loading ${pdfLabel}:`, err);
          setError(
            err instanceof Error
              ? err.message
              : "Could not load PDF. It may be corrupt or password-protected."
          );
        } finally {
          setLoading(false);
        }
      };
    },
    []
  );

  const loadPDF1 = useCallback(
    createPDFLoader(setPdfDoc1, setPdfFile1, setIsLoading1, setError1, "PDF 1"),
    [createPDFLoader]
  );

  const loadPDF2 = useCallback(
    createPDFLoader(setPdfDoc2, setPdfFile2, setIsLoading2, setError2, "PDF 2"),
    [createPDFLoader]
  );

  const resetPDF1 = useCallback(() => {
    setPdfDoc1(null);
    setPdfFile1(null);
    setError1(null);
    setIsLoading1(false);
  }, []);

  const resetPDF2 = useCallback(() => {
    setPdfDoc2(null);
    setPdfFile2(null);
    setError2(null);
    setIsLoading2(false);
  }, []);

  const handleSetViewMode = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    if (mode === "side-by-side") {
      setOpacity(1);
    }
  }, []);

  const handleSetOpacity = useCallback((newOpacity: number) => {
    setOpacity(newOpacity);
  }, []);

  const handleSetIsSyncScroll = useCallback((sync: boolean) => {
    setIsSyncScroll(sync);
  }, []);

  const getMaxPages = useCallback(() => {
    const pages1 = pdfDoc1?.numPages || 0;
    const pages2 = pdfDoc2?.numPages || 0;
    return Math.max(pages1, pages2);
  }, [pdfDoc1, pdfDoc2]);

  const nextPage = useCallback(() => {
    const maxPages = getMaxPages();
    if (currentPage < maxPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, getMaxPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const goToPage = useCallback(
    (page: number) => {
      const maxPages = getMaxPages();
      if (page >= 1 && page <= maxPages) {
        setCurrentPage(page);
      }
    },
    [getMaxPages]
  );

  const handleRenderPage = useCallback(
    async (
      pdfDoc: PDFDocumentProxy | null,
      pageNum: number,
      canvas: HTMLCanvasElement,
      container: HTMLElement
    ) => {
      await renderPage(pdfDoc, pageNum, canvas, container);
    },
    []
  );

  return {
    pdfDoc1,
    pdfDoc2,
    pdfFile1,
    pdfFile2,
    isLoading1,
    isLoading2,
    error1,
    error2,
    currentPage,
    viewMode,
    opacity,
    isSyncScroll,
    loadPDF1,
    loadPDF2,
    resetPDF1,
    resetPDF2,
    setViewMode: handleSetViewMode,
    setOpacity: handleSetOpacity,
    setIsSyncScroll: handleSetIsSyncScroll,
    nextPage,
    prevPage,
    goToPage,
    renderPage: handleRenderPage,
  };
};
