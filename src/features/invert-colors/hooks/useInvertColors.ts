"use client";

import { useCallback } from "react";
import { invertColors } from "../lib/invert-colors-logic";
import { saveAndDownloadPDF } from "@/lib/pdf/file-utils";
import { usePDFProcessor } from "@/hooks/usePDFProcessor";
import type { UseInvertColorsReturn } from "../types";

export const useInvertColors = (): UseInvertColorsReturn => {
  const {
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
    resetPDF,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
    resetProcessing,
  } = usePDFProcessor();

  const processInvertColors = useCallback(async () => {
    if (!pdfFile) {
      setError("Please upload a PDF file first.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage("Inverting PDF colors...");

    try {
      const pdfBytes = await invertColors(pdfFile, (current, total) => {
        setLoadingMessage(`Processing page ${current} of ${total}...`);
      });

      setLoadingMessage("Preparing download...");
      saveAndDownloadPDF(pdfBytes, pdfFile.name);
      setSuccess("Colors inverted successfully!");
    } catch (err) {
      console.error("Error inverting colors:", err);
      setError(
        err instanceof Error
          ? `Failed to invert colors: ${err.message}`
          : "Could not invert PDF colors. Please check your inputs.",
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [pdfFile, setIsProcessing, setError, setSuccess, setLoadingMessage]);

  const reset = useCallback(() => {
    resetProcessing();
    resetPDF();
  }, [resetProcessing, resetPDF]);

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
    processInvertColors,
    reset,
  };
};
