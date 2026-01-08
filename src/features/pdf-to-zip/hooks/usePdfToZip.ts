"use client";

import { useState, useCallback } from "react";
import { useFileInfoLoader } from "@/hooks/useFileInfoLoader";
import { pdfsToZip } from "../lib/pdf-to-zip-logic";
import { downloadFile, formatBytes } from "@/lib/pdf/file-utils";
import type { UsePdfToZipReturn } from "../types";

export const usePdfToZip = (): UsePdfToZipReturn => {
  const {
    fileInfos: pdfFiles,
    isLoading,
    loadingMessage: fileLoadingMessage,
    error: fileError,
    success: fileSuccess,
    loadFiles,
    removeFile,
    reset: resetFiles,
  } = useFileInfoLoader({
    acceptMimeTypes: ["application/pdf"],
    acceptExtensions: [".pdf"],
    errorMessages: {
      noFiles: "Please select at least one PDF file.",
      noValidFiles: "No valid PDF files were found.",
      invalidFiles: (fileNames: string[]) =>
        `The following files are not valid PDFs: ${fileNames.join(", ")}`,
    },
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLoadingMessage, setProcessingLoadingMessage] = useState<
    string | null
  >(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [processingSuccess, setProcessingSuccess] = useState<string | null>(
    null,
  );

  const loadPdfFiles = useCallback(
    async (files: File[]) => {
      await loadFiles(files);
    },
    [loadFiles],
  );

  const removePdfFile = useCallback(
    (id: string) => {
      removeFile(id);
    },
    [removeFile],
  );

  const processPdfToZip = useCallback(async () => {
    if (pdfFiles.length === 0) {
      setProcessingError("Please upload at least one PDF file.");
      return;
    }

    setIsProcessing(true);
    setProcessingError(null);
    setProcessingSuccess(null);
    setProcessingLoadingMessage("Reading files...");

    try {
      setProcessingLoadingMessage("Creating ZIP file...");

      const files = pdfFiles.map((fileInfo) => fileInfo.file);
      const zipBlob = await pdfsToZip(files);

      setProcessingLoadingMessage("Preparing download...");

      const baseName = pdfFiles[0]?.fileName.replace(/\.pdf$/i, "") || "pdfs";
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const zipFileName = `${timestamp}_${baseName}.zip`;

      downloadFile(zipBlob, undefined, zipFileName);

      const totalSize = pdfFiles.reduce(
        (sum, fileInfo) => sum + fileInfo.fileSize,
        0,
      );
      const successMessage = `ZIP file created successfully! ${pdfFiles.length} PDF file(s) in zip file (${formatBytes(totalSize)}). Download started.`;
      setProcessingSuccess(successMessage);

      resetFiles();
    } catch (err) {
      console.error("Error creating ZIP file:", err);
      setProcessingError(
        err instanceof Error
          ? err.message
          : "An error occurred while creating the ZIP file.",
      );
    } finally {
      setIsProcessing(false);
      setProcessingLoadingMessage(null);
    }
  }, [pdfFiles, resetFiles]);

  const reset = useCallback(() => {
    resetFiles();
    setIsProcessing(false);
    setProcessingLoadingMessage(null);
    setProcessingError(null);
    setProcessingSuccess(null);
  }, [resetFiles]);

  return {
    pdfFiles,
    isLoading,
    isProcessing,
    loadingMessage: processingLoadingMessage || fileLoadingMessage,
    error: processingError || fileError,
    success: processingSuccess || fileSuccess,
    loadPdfFiles,
    removePdfFile,
    processPdfToZip,
    reset,
  };
};
