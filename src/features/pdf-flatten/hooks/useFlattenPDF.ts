"use client";

import { useCallback } from "react";
import { flattenPDF } from "../lib/flatten-logic";
import { saveAndDownloadPDF } from "@/lib/pdf/file-utils";
import { usePDFProcessor } from "@/hooks/usePDFProcessor";
import type { UseFlattenPDFReturn } from "../types";

export const useFlattenPDF = (): UseFlattenPDFReturn => {
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

  const processFlatten = useCallback(async () => {
    if (!pdfDoc) {
      setError("Please upload a PDF file first.");
      return;
    }

    if (!pdfFile) {
      setError("PDF file is not available. Please try uploading again.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage("Flattening PDF...");

    try {
      const flattenedPdf = await flattenPDF(pdfDoc);
      const pdfBytes = await flattenedPdf.save();
      saveAndDownloadPDF(pdfBytes, pdfFile.name);
      setSuccess("PDF flattened successfully!");
    } catch (err) {
      console.error("Error flattening PDF:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not flatten the PDF. Please check your file and try again.",
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfDoc,
    pdfFile,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
  ]);

  const reset = useCallback(() => {
    resetProcessing();
    resetPDF();
  }, [resetProcessing, resetPDF]);

  return {
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    loadPDF,
    processFlatten,
    reset,
  };
};
