"use client";

import { useCallback } from "react";
import { usePDFProcessor } from "@/hooks/usePDFProcessor";
import { pdfToMarkdown } from "../lib/pdf-to-markdown-logic";
import { downloadFile } from "@/lib/pdf/file-utils";
import type { UsePdfToMarkdownReturn } from "../types";

export const usePdfToMarkdown = (): UsePdfToMarkdownReturn => {
  const {
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    isProcessing,
    loadingMessage,
    error,
    success,
    totalPages,
    loadPDF,
    resetPDF,
    setIsProcessing,
    setLoadingMessage,
    setError,
    setSuccess,
    resetProcessing,
  } = usePDFProcessor();

  const processPdfToMarkdown = useCallback(async () => {
    if (!pdfFile) {
      setError("Please upload a PDF file first.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage("Converting to Markdown...");

    try {
      const markdown = await pdfToMarkdown(
        pdfFile,
        (currentPage, totalPages) => {
          setLoadingMessage(
            `Processing page ${currentPage} of ${totalPages}...`,
          );
        },
      );

      setLoadingMessage("Preparing download...");

      const blob = new Blob([markdown], { type: "text/markdown" });
      const baseName =
        pdfFile.name.replace(/\.pdf$/i, "") || "converted-markdown";
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `${timestamp}_${baseName}.md`;

      downloadFile(blob, pdfFile.name, filename);
      setSuccess("PDF converted to Markdown successfully! File downloaded.");
    } catch (err) {
      console.error("PDF to Markdown conversion error:", err);
      setError(
        err instanceof Error
          ? `Failed to convert PDF to Markdown: ${err.message}`
          : "Failed to convert PDF. It may be image-based or corrupted.",
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [pdfFile, setIsProcessing, setLoadingMessage, setError, setSuccess]);

  const reset = useCallback(() => {
    resetPDF();
    resetProcessing();
  }, [resetPDF, resetProcessing]);

  return {
    pdfFile,
    pdfDoc,
    isProcessing,
    loadingMessage,
    error,
    success,
    isLoadingPDF,
    pdfError,
    totalPages,
    loadPDF,
    processPdfToMarkdown,
    reset,
  };
};
