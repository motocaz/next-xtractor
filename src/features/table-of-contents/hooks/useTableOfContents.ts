"use client";

import { useState, useCallback } from "react";
import { generateTableOfContents } from "../lib/table-of-contents-logic";
import { saveAndDownloadPDF } from "@/lib/pdf/file-utils";
import { usePDFProcessor } from "@/hooks/usePDFProcessor";

export interface UseTableOfContentsReturn {
  title: string;
  fontSize: number;
  fontFamily: number;
  addBookmark: boolean;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  pdfFile: File | null;
  pdfDoc: ReturnType<typeof usePDFProcessor>["pdfDoc"];
  isLoadingPDF: boolean;
  pdfError: string | null;
  totalPages: number;
  setTitle: (title: string) => void;
  setFontSize: (fontSize: number) => void;
  setFontFamily: (fontFamily: number) => void;
  setAddBookmark: (addBookmark: boolean) => void;
  loadPDF: (file: File) => Promise<void>;
  generateTOC: () => Promise<void>;
  reset: () => void;
}

export const useTableOfContents = (): UseTableOfContentsReturn => {
  const [title, setTitle] = useState<string>("Table of Contents");
  const [fontSize, setFontSize] = useState<number>(12);
  const [fontFamily, setFontFamily] = useState<number>(4);
  const [addBookmark, setAddBookmark] = useState<boolean>(true);

  const {
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfDoc,
    pdfFile,
    isLoadingPDF,
    pdfError,
    loadPDF,
    resetPDF,
    totalPages,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
    resetProcessing,
  } = usePDFProcessor();

  const generateTOC = useCallback(async () => {
    if (!pdfFile) {
      setError("Please upload a PDF file first.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage("Generating table of contents...");

    try {
      const pdfBytes = await generateTableOfContents(pdfFile, {
        title,
        fontSize,
        fontFamily,
        addBookmark,
      });
      saveAndDownloadPDF(pdfBytes, pdfFile.name);
      setSuccess("Table of contents generated successfully! Download started.");
    } catch (err) {
      console.error("Error generating table of contents:", err);
      setError(
        err instanceof Error
          ? `Failed to generate table of contents: ${err.message}`
          : "Could not generate table of contents. Please check that your PDF has bookmarks.",
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfFile,
    title,
    fontSize,
    fontFamily,
    addBookmark,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
  ]);

  const reset = useCallback(() => {
    setTitle("Table of Contents");
    setFontSize(12);
    setFontFamily(4);
    setAddBookmark(true);
    resetProcessing();
    resetPDF();
  }, [resetProcessing, resetPDF]);

  return {
    title,
    fontSize,
    fontFamily,
    addBookmark,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    setTitle,
    setFontSize,
    setFontFamily,
    setAddBookmark,
    loadPDF,
    generateTOC,
    reset,
  };
};
