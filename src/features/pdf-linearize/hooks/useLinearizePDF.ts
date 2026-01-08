"use client";

import { useCallback } from "react";
import JSZip from "jszip";
import { useMultiPDFProcessor } from "@/hooks/useMultiPDFProcessor";
import { linearizePDFs } from "../lib/linearize-logic";
import { downloadFile } from "@/lib/pdf/file-utils";
import type { UseLinearizePDFReturn } from "../types";

export const useLinearizePDF = (): UseLinearizePDFReturn => {
  const {
    pdfFiles,
    isProcessing,
    loadingMessage,
    error,
    success,
    loadPDFs,
    removePDF,
    reset,
    setIsProcessing,
    setLoadingMessage,
    setError,
    setSuccess,
  } = useMultiPDFProcessor();

  const linearizePDFsHandler = useCallback(async () => {
    if (pdfFiles.length === 0) {
      setError("Please upload at least one PDF file.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage("Initializing optimization engine...");

    try {
      const results = await linearizePDFs(
        pdfFiles,
        (current, total, fileName) => {
          setLoadingMessage(`Optimizing ${fileName} (${current}/${total})...`);
        },
      );

      if (results.length === 0) {
        setError("No PDF files could be linearized.");
        setIsProcessing(false);
        setLoadingMessage(null);
        return;
      }

      setLoadingMessage("Generating ZIP file...");

      const zip = new JSZip();
      for (const result of results) {
        const arrayBuffer = await result.blob.arrayBuffer();
        zip.file(result.fileName, arrayBuffer);
      }

      setLoadingMessage("Preparing download...");

      const zipBlob = await zip.generateAsync({ type: "blob" });

      const baseName =
        pdfFiles[0]?.name.replace(/\.pdf$/i, "") || "linearized-pdfs";
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const zipFileName = `${timestamp}_${baseName}.zip`;

      downloadFile(zipBlob, undefined, zipFileName);

      const successCount = results.length;
      const errorCount = pdfFiles.length - successCount;
      let successMessage = `${successCount} PDF(s) linearized successfully.`;
      if (errorCount > 0) {
        successMessage += ` ${errorCount} file(s) failed.`;
      }

      setSuccess(successMessage);
    } catch (err) {
      console.error("Error linearizing PDFs:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while linearizing PDFs.",
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [pdfFiles, setIsProcessing, setError, setSuccess, setLoadingMessage]);

  return {
    pdfFiles,
    isProcessing,
    loadingMessage,
    error,
    success,
    loadPDFs,
    removePDF,
    linearizePDFs: linearizePDFsHandler,
    reset,
  };
};
