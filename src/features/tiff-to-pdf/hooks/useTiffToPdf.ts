"use client";

import { useState, useCallback } from "react";
import { tiffToPdf } from "../lib/tiff-to-pdf-logic";
import { handleImageToPdfResult } from "@/lib/pdf/image-to-pdf-utils";
import type { TiffFileInfo, UseTiffToPdfReturn } from "../types";

export const useTiffToPdf = (): UseTiffToPdfReturn => {
  const [tiffFiles, setTiffFiles] = useState<TiffFileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [failedFiles, setFailedFiles] = useState<string[]>([]);

  const loadTiffFiles = useCallback(async (files: File[]) => {
    if (!files || files.length === 0) {
      setError("Please select at least one TIFF file.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage("Validating TIFF files...");

    try {
      const validFiles: TiffFileInfo[] = [];
      const invalidFiles: string[] = [];

      for (const file of files) {
        const isTiff =
          file.type === "image/tiff" ||
          file.type === "image/tif" ||
          file.name.toLowerCase().endsWith(".tiff") ||
          file.name.toLowerCase().endsWith(".tif");

        if (!isTiff) {
          invalidFiles.push(file.name);
          continue;
        }

        const id = `${file.name}-${Date.now()}-${Math.random()}`;
        validFiles.push({
          id,
          file,
          fileName: file.name,
          fileSize: file.size,
        });
      }

      if (invalidFiles.length > 0) {
        setError(
          `The following files are not valid TIFF images: ${invalidFiles.join(", ")}`,
        );
      }

      if (validFiles.length === 0) {
        setError(
          "No valid TIFF files were found. Please select TIFF image files.",
        );
      } else {
        setTiffFiles((prev) => [...prev, ...validFiles]);
        if (validFiles.length > 0 && invalidFiles.length === 0) {
          setSuccess(`${validFiles.length} TIFF file(s) loaded successfully.`);
        }
      }
    } catch (err) {
      console.error("Error loading TIFF files:", err);
      setError(
        err instanceof Error
          ? `Failed to load TIFF files: ${err.message}`
          : "Failed to load TIFF files. Please check your files.",
      );
    } finally {
      setIsLoading(false);
      setLoadingMessage(null);
    }
  }, []);

  const removeTiffFile = useCallback((id: string) => {
    setTiffFiles((prev) => prev.filter((file) => file.id !== id));
    setError(null);
    setSuccess(null);
  }, []);

  const processTiffToPdf = useCallback(async () => {
    if (tiffFiles.length === 0) {
      setError("Please upload at least one TIFF file.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setFailedFiles([]);
    setLoadingMessage("Converting TIFF to PDF...");

    try {
      const files = tiffFiles.map((fileInfo) => fileInfo.file);
      const result = await tiffToPdf(files);

      await handleImageToPdfResult({
        result,
        firstFileName: tiffFiles[0]?.fileName || "converted",
        extensionPattern: /\.(tiff|tif)$/i,
        stateSetters: {
          setFailedFiles,
          setSuccess,
        },
      });
    } catch (err) {
      console.error("TIFF to PDF conversion error:", err);
      setError(
        err instanceof Error
          ? `An error occurred while converting: ${err.message}`
          : "An error occurred while converting TIFF to PDF. One of the files may be invalid.",
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [tiffFiles]);

  const reset = useCallback(() => {
    setTiffFiles([]);
    setError(null);
    setSuccess(null);
    setFailedFiles([]);
    setLoadingMessage(null);
    setIsLoading(false);
    setIsProcessing(false);
  }, []);

  return {
    tiffFiles,
    isLoading,
    isProcessing,
    loadingMessage,
    error,
    success,
    failedFiles,
    loadTiffFiles,
    removeTiffFile,
    processTiffToPdf,
    reset,
  };
};
