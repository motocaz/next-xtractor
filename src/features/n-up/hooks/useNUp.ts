"use client";

import { useState, useCallback } from "react";
import { createNUpPDF } from "../lib/n-up-logic";
import { saveAndDownloadPDF } from "@/lib/pdf/file-utils";
import { usePDFProcessor } from "@/hooks/usePDFProcessor";
import type {
  UseNUpReturn,
  PagesPerSheet,
  PageSize,
  Orientation,
} from "../types";

export const useNUp = (): UseNUpReturn => {
  const [pagesPerSheet, setPagesPerSheet] = useState<PagesPerSheet>(4);
  const [pageSize, setPageSize] = useState<PageSize>("A4");
  const [orientation, setOrientation] = useState<Orientation>("auto");
  const [useMargins, setUseMargins] = useState<boolean>(true);
  const [addBorder, setAddBorder] = useState<boolean>(false);
  const [borderColor, setBorderColor] = useState<string>("#000000");

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

  const processNUp = useCallback(async () => {
    if (!pdfDoc) {
      setError("Please upload a PDF file first.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage("Creating N-Up PDF...");

    try {
      const newPdfDoc = await createNUpPDF(pdfDoc, {
        pagesPerSheet,
        pageSize,
        orientation,
        useMargins,
        addBorder,
        borderColor,
      });

      const pdfBytes = await newPdfDoc.save();
      saveAndDownloadPDF(pdfBytes, pdfFile?.name);
      setSuccess("N-Up PDF created successfully!");
    } catch (err) {
      console.error("Error creating N-Up PDF:", err);
      setError(
        err instanceof Error
          ? `Failed to create N-Up PDF: ${err.message}`
          : "An error occurred while creating the N-Up PDF.",
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfDoc,
    pdfFile,
    pagesPerSheet,
    pageSize,
    orientation,
    useMargins,
    addBorder,
    borderColor,
    totalPages,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
  ]);

  const reset = useCallback(() => {
    setPagesPerSheet(4);
    setPageSize("A4");
    setOrientation("auto");
    setUseMargins(true);
    setAddBorder(false);
    setBorderColor("#000000");
    resetProcessing();
    resetPDF();
  }, [resetProcessing, resetPDF]);

  return {
    pagesPerSheet,
    pageSize,
    orientation,
    useMargins,
    addBorder,
    borderColor,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    setPagesPerSheet,
    setPageSize,
    setOrientation,
    setUseMargins,
    setAddBorder,
    setBorderColor,
    loadPDF,
    processNUp,
    reset,
  };
};
