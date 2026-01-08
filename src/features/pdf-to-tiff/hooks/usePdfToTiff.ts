"use client";

import { useState, useCallback } from "react";
import { usePDFProcessor } from "@/hooks/usePDFProcessor";
import { pdfToTiff } from "../lib/pdf-to-tiff-logic";
import { downloadFile } from "@/lib/pdf/file-utils";
import type { UsePdfToTiffReturn } from "../types";

export const usePdfToTiff = (): UsePdfToTiffReturn => {
  const [scale, setScale] = useState<number>(2);

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

  const processPdfToTiff = useCallback(async () => {
    if (!pdfFile) {
      setError("Please upload a PDF file first.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage("Converting PDF to TIFF images...");

    try {
      const zipBlob = await pdfToTiff(
        pdfFile,
        scale,
        (currentPage, totalPages) => {
          setLoadingMessage(
            `Processing page ${currentPage} of ${totalPages}...`,
          );
        },
      );

      setLoadingMessage("Compressing files into a ZIP...");

      const baseName =
        pdfFile.name.replace(/\.pdf$/i, "") || "converted_tiff_images";
      const timestamp = new Date().toISOString();
      const filename = `${timestamp}_${baseName}.zip`;

      downloadFile(zipBlob, undefined, filename);
      setSuccess(
        "PDF converted to TIFF images successfully! ZIP file downloaded.",
      );
    } catch (err) {
      console.error("PDF to TIFF conversion error:", err);
      setError(
        err instanceof Error
          ? `Failed to convert PDF to TIFF: ${err.message}`
          : "Failed to convert PDF to TIFF. The file might be corrupted.",
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfFile,
    scale,
    setIsProcessing,
    setLoadingMessage,
    setError,
    setSuccess,
  ]);

  const reset = useCallback(() => {
    setScale(2);
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
    scale,
    setScale,
    processPdfToTiff,
    reset,
  };
};
