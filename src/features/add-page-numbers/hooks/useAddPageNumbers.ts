"use client";

import { useState, useCallback } from "react";
import { addPageNumbers } from "../lib/add-page-numbers-logic";
import { saveAndDownloadPDF } from "@/lib/pdf/file-utils";
import { usePDFProcessor } from "@/hooks/usePDFProcessor";
import type { UseAddPageNumbersReturn, PageNumbersOptions } from "../types";

export const useAddPageNumbers = (): UseAddPageNumbersReturn => {
  const [position, setPosition] = useState<string>("bottom-center");
  const [fontSize, setFontSize] = useState<string>("12");
  const [format, setFormat] = useState<string>("default");
  const [textColor, setTextColor] = useState<string>("#000000");

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

  const processPageNumbers = useCallback(async () => {
    if (!pdfDoc) {
      setError("Please upload a PDF file first.");
      return;
    }

    const fontSizeNum = Number.parseInt(fontSize, 10);
    if (isNaN(fontSizeNum) || fontSizeNum <= 0) {
      setError("Please enter a valid font size (greater than 0).");
      return;
    }

    if (
      ![
        "bottom-center",
        "bottom-left",
        "bottom-right",
        "top-center",
        "top-left",
        "top-right",
      ].includes(position)
    ) {
      setError("Please select a valid position.");
      return;
    }

    if (!["default", "page_x_of_y"].includes(format)) {
      setError("Please select a valid format.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage("Adding page numbers...");

    try {
      const options = {
        position: position as PageNumbersOptions["position"],
        fontSize: fontSizeNum,
        format: format as PageNumbersOptions["format"],
        textColor,
      };

      const newPdf = await addPageNumbers(pdfDoc, options);
      const pdfBytes = await newPdf.save();
      saveAndDownloadPDF(pdfBytes, pdfFile?.name);

      setSuccess("Page numbers added successfully!");
    } catch (err) {
      console.error("Error adding page numbers:", err);
      setError(
        err instanceof Error
          ? `Failed to add page numbers: ${err.message}`
          : "Could not add page numbers.",
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfDoc,
    position,
    fontSize,
    format,
    textColor,
    pdfFile,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
  ]);

  const reset = useCallback(() => {
    setPosition("bottom-center");
    setFontSize("12");
    setFormat("default");
    setTextColor("#000000");
    resetProcessing();
    resetPDF();
  }, [resetProcessing, resetPDF]);

  return {
    position,
    fontSize,
    format,
    textColor,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,

    setPosition,
    setFontSize,
    setFormat,
    setTextColor,
    loadPDF,
    processPageNumbers,
    reset,
  };
};
