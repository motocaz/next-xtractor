"use client";

import { useState, useCallback } from "react";
import { usePDFProcessor } from "@/hooks/usePDFProcessor";
import { saveAndDownloadPDF } from "@/lib/pdf/file-utils";
import { splitInHalf } from "../lib/split-in-half-logic";
import type { UseSplitInHalfReturn, SplitType } from "../types";

const DEFAULT_SPLIT_TYPE: SplitType = "vertical";

export const useSplitInHalf = (): UseSplitInHalfReturn => {
  const [splitType, setSplitType] = useState<SplitType>(DEFAULT_SPLIT_TYPE);

  const {
    pdfDoc,
    pdfFile,
    isProcessing,
    loadingMessage,
    error,
    success,
    isLoadingPDF,
    pdfError,
    totalPages,
    loadPDF: baseLoadPDF,
    resetPDF,
    setIsProcessing,
    setLoadingMessage,
    setError,
    setSuccess,
    resetProcessing,
  } = usePDFProcessor();

  const processSplit = useCallback(async () => {
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
    setLoadingMessage("Splitting PDF pages...");

    try {
      const pdfBytes = await splitInHalf(
        pdfDoc,
        splitType,
        (current, total) => {
          setLoadingMessage(`Processing page ${current} of ${total}...`);
        },
      );

      saveAndDownloadPDF(pdfBytes, pdfFile.name);
      setSuccess("PDF split successfully!");
    } catch (err) {
      console.error("Error splitting PDF:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while splitting the PDF. Please try again.",
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfDoc,
    pdfFile,
    splitType,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
  ]);

  const reset = useCallback(() => {
    setSplitType(DEFAULT_SPLIT_TYPE);
    resetProcessing();
    resetPDF();
  }, [resetProcessing, resetPDF]);

  return {
    splitType,
    pdfFile,
    pdfDoc,
    isProcessing,
    loadingMessage,
    error,
    success,
    isLoadingPDF,
    pdfError,
    totalPages,
    setSplitType,
    loadPDF: baseLoadPDF,
    processSplit,
    reset,
  };
};
