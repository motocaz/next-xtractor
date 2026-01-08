"use client";

import { useState, useCallback } from "react";
import { usePDFProcessor } from "@/hooks/usePDFProcessor";
import { pdfToJpg } from "../lib/pdf-to-jpg-logic";
import { downloadFile } from "@/lib/pdf/file-utils";
import type { UsePdfToJpgReturn } from "../types";

export const usePdfToJpg = (): UsePdfToJpgReturn => {
  const [quality, setQuality] = useState<number>(0.9);

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

  const processPdfToJpg = useCallback(async () => {
    if (!pdfFile) {
      setError("Please upload a PDF file first.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage("Converting PDF to JPG images...");

    try {
      const zipBlob = await pdfToJpg(
        pdfFile,
        quality,
        (currentPage, totalPages) => {
          setLoadingMessage(
            `Processing page ${currentPage} of ${totalPages}...`,
          );
        },
      );

      setLoadingMessage("Compressing files into a ZIP...");

      const baseName =
        pdfFile.name.replace(/\.pdf$/i, "") || "converted_jpg_images";
      const timestamp = new Date().toISOString();
      const filename = `${timestamp}_${baseName}.zip`;

      downloadFile(zipBlob, undefined, filename);
      setSuccess(
        "PDF converted to JPG images successfully! ZIP file downloaded.",
      );
    } catch (err) {
      console.error("PDF to JPG conversion error:", err);
      setError(
        err instanceof Error
          ? `Failed to convert PDF to JPG: ${err.message}`
          : "Failed to convert PDF to JPG. The file might be corrupted.",
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfFile,
    quality,
    setIsProcessing,
    setLoadingMessage,
    setError,
    setSuccess,
  ]);

  const reset = useCallback(() => {
    setQuality(0.9);
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
    quality,
    setQuality,
    processPdfToJpg,
    reset,
  };
};
