"use client";

import { useState, useCallback } from "react";
import JSZip from "jszip";
import { useMultiPDFLoader } from "@/hooks/useMultiPDFLoader";
import { reversePagesInPDF } from "../lib/reverse-pages-logic";
import { downloadFile, formatBytes } from "@/lib/pdf/file-utils";
import type { UseReversePagesReturn } from "../types";

export const useReversePages = (): UseReversePagesReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLoadingMessage, setProcessingLoadingMessage] = useState<
    string | null
  >(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [processingSuccess, setProcessingSuccess] = useState<string | null>(
    null,
  );

  const {
    pdfFiles,
    isLoading,
    loadingMessage,
    error,
    warning,
    loadPDFs,
    removePDF,
    reorderFiles,
    reset: resetLoader,
  } = useMultiPDFLoader({
    onEncryptedFiles: "error",
    allowEncrypted: false,
    errorMessages: {
      noFiles: "Please select at least one PDF file.",
      noValidFiles: "No valid PDF files were loaded.",
      encryptedFiles:
        "The following PDFs are password-protected and were skipped. Please use the Decrypt tool first:\n",
      loadFailed: (fileName: string) =>
        `Failed to load ${fileName}. The file may be corrupted or password-protected.`,
    },
  });

  const reversePages = useCallback(async () => {
    if (pdfFiles.length === 0) {
      setProcessingError("Please upload at least one PDF file.");
      return;
    }

    setIsProcessing(true);
    setProcessingError(null);
    setProcessingSuccess(null);
    setProcessingLoadingMessage("Preparing to reverse pages...");

    try {
      setProcessingLoadingMessage("Reversing page order...");
      const zip = new JSZip();
      let totalSize = 0;

      for (let i = 0; i < pdfFiles.length; i++) {
        const pdfInfo = pdfFiles[i];
        setProcessingLoadingMessage(
          `Reversing pages ${i + 1}/${pdfFiles.length}: ${pdfInfo.fileName}...`,
        );

        const reversedBytes = await reversePagesInPDF(pdfInfo.pdfDoc);
        totalSize += reversedBytes.length;

        const originalName = pdfInfo.fileName.replace(/\.pdf$/i, "");
        const fileName = `${originalName}_reversed.pdf`;
        zip.file(fileName, reversedBytes);
      }

      setProcessingLoadingMessage("Creating ZIP file...");
      const zipBlob = await zip.generateAsync({ type: "blob" });

      setProcessingLoadingMessage("Preparing download...");

      const baseName =
        pdfFiles[0]?.fileName.replace(/\.pdf$/i, "") || "reversed_pdfs";
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const zipFileName = `${timestamp}_${baseName}.zip`;

      downloadFile(zipBlob, undefined, zipFileName);

      const successMessage = `Reversed ${pdfFiles.length} PDF file(s). Total size: ${formatBytes(totalSize)}. Download started.`;
      setProcessingSuccess(successMessage);
    } catch (err) {
      console.error("Error reversing pages:", err);
      setProcessingError(
        err instanceof Error
          ? `An error occurred while reversing pages: ${err.message}`
          : "An error occurred while reversing pages. Please check your files.",
      );
    } finally {
      setIsProcessing(false);
      setProcessingLoadingMessage(null);
    }
  }, [pdfFiles]);

  const reset = useCallback(() => {
    resetLoader();
    setIsProcessing(false);
    setProcessingLoadingMessage(null);
    setProcessingError(null);
    setProcessingSuccess(null);
  }, [resetLoader]);

  const loadingMessageCombined = loadingMessage || processingLoadingMessage;
  const errorCombined = error || processingError;
  const successCombined = processingSuccess;

  return {
    pdfFiles,
    isLoading,
    loadingMessage: loadingMessageCombined,
    error: errorCombined,
    warning,
    isProcessing,
    processingLoadingMessage,
    processingError,
    processingSuccess: successCombined,
    loadPDFs,
    removePDF,
    reorderFiles,
    reversePages,
    reset,
  };
};
