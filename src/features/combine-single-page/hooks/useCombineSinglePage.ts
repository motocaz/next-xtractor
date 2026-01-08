"use client";

import { useState, useCallback } from "react";
import { combineToSinglePage } from "../lib/combine-single-page-logic";
import { downloadFile } from "@/lib/pdf/file-utils";
import { usePDFProcessor } from "@/hooks/usePDFProcessor";
import type { UseCombineSinglePageReturn } from "../types";

const DEFAULT_SPACING = 18;
const DEFAULT_BACKGROUND_COLOR = "#FFFFFF";
const DEFAULT_ADD_SEPARATOR = false;

export const useCombineSinglePage = (): UseCombineSinglePageReturn => {
  const [spacing, setSpacing] = useState<number>(DEFAULT_SPACING);
  const [backgroundColorHex, setBackgroundColorHex] = useState<string>(
    DEFAULT_BACKGROUND_COLOR,
  );
  const [addSeparator, setAddSeparator] = useState<boolean>(
    DEFAULT_ADD_SEPARATOR,
  );

  const {
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    isLoadingPDF,
    pdfError,
    loadPDF,
    resetPDF,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
    resetProcessing,
  } = usePDFProcessor();

  const processCombine = useCallback(async () => {
    if (!pdfFile) {
      setError("Please upload a PDF file first.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage("Initializing...");

    try {
      setLoadingMessage("Combining pages...");

      const blob = await combineToSinglePage(
        pdfFile,
        spacing,
        backgroundColorHex,
        addSeparator,
        (current, total) => {
          setLoadingMessage(`Processing page ${current} of ${total}...`);
        },
      );

      setLoadingMessage("Preparing download...");
      downloadFile(blob, pdfFile.name);

      setSuccess("Pages combined successfully!");
    } catch (err) {
      console.error("Error combining pages:", err);

      if (err instanceof Error) {
        setError(
          `An error occurred: ${err.message || "Could not combine pages."}`,
        );
      } else {
        setError(
          "An error occurred while processing the PDF. Please try again.",
        );
      }
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfFile,
    spacing,
    backgroundColorHex,
    addSeparator,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
  ]);

  const handleSetSpacing = useCallback((value: number) => {
    setSpacing(value);
  }, []);

  const handleSetBackgroundColorHex = useCallback((color: string) => {
    setBackgroundColorHex(color);
  }, []);

  const handleSetAddSeparator = useCallback((add: boolean) => {
    setAddSeparator(add);
  }, []);

  const reset = useCallback(() => {
    setSpacing(DEFAULT_SPACING);
    setBackgroundColorHex(DEFAULT_BACKGROUND_COLOR);
    setAddSeparator(DEFAULT_ADD_SEPARATOR);
    resetProcessing();
    resetPDF();
  }, [resetProcessing, resetPDF]);

  return {
    pdfFile,
    spacing,
    backgroundColorHex,
    addSeparator,
    isProcessing,
    loadingMessage,
    error,
    success,
    isLoadingPDF,
    pdfError,
    setSpacing: handleSetSpacing,
    setBackgroundColorHex: handleSetBackgroundColorHex,
    setAddSeparator: handleSetAddSeparator,
    loadPDF,
    processCombine,
    reset,
  };
};
