"use client";

import { useState, useCallback } from "react";
import { bmpToPdf } from "../lib/bmp-to-pdf-logic";
import { handleImageToPdfResult } from "@/lib/pdf/image-to-pdf-utils";
import type { BmpFileInfo, UseBmpToPdfReturn } from "../types";

export const useBmpToPdf = (): UseBmpToPdfReturn => {
  const [bmpFiles, setBmpFiles] = useState<BmpFileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [failedFiles, setFailedFiles] = useState<string[]>([]);

  const loadBmpFiles = useCallback(async (files: File[]) => {
    if (!files || files.length === 0) {
      setError("Please select at least one BMP file.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage("Validating BMP files...");

    try {
      const validFiles: BmpFileInfo[] = [];
      const invalidFiles: string[] = [];

      for (const file of files) {
        if (
          file.type !== "image/bmp" &&
          !file.name.toLowerCase().endsWith(".bmp")
        ) {
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
          `The following files are not valid BMP images: ${invalidFiles.join(", ")}`,
        );
      }

      if (validFiles.length === 0) {
        setError(
          "No valid BMP files were found. Please select BMP image files.",
        );
      } else {
        setBmpFiles((prev) => [...prev, ...validFiles]);
        if (validFiles.length > 0 && invalidFiles.length === 0) {
          setSuccess(`${validFiles.length} BMP file(s) loaded successfully.`);
        }
      }
    } catch (err) {
      console.error("Error loading BMP files:", err);
      setError(
        err instanceof Error
          ? `Failed to load BMP files: ${err.message}`
          : "Failed to load BMP files. Please check your files.",
      );
    } finally {
      setIsLoading(false);
      setLoadingMessage(null);
    }
  }, []);

  const removeBmpFile = useCallback((id: string) => {
    setBmpFiles((prev) => prev.filter((file) => file.id !== id));
    setError(null);
    setSuccess(null);
  }, []);

  const processBmpToPdf = useCallback(async () => {
    if (bmpFiles.length === 0) {
      setError("Please upload at least one BMP file.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setFailedFiles([]);
    setLoadingMessage("Converting BMP to PDF...");

    try {
      const files = bmpFiles.map((fileInfo) => fileInfo.file);
      const result = await bmpToPdf(files);

      await handleImageToPdfResult({
        result,
        firstFileName: bmpFiles[0]?.fileName || "converted",
        extensionPattern: /\.bmp$/i,
        stateSetters: {
          setFailedFiles,
          setSuccess,
        },
      });
    } catch (err) {
      console.error("BMP to PDF conversion error:", err);
      setError(
        err instanceof Error
          ? `An error occurred while converting: ${err.message}`
          : "An error occurred while converting BMP to PDF. One of the files may be invalid.",
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [bmpFiles]);

  const reset = useCallback(() => {
    setBmpFiles([]);
    setError(null);
    setSuccess(null);
    setFailedFiles([]);
    setLoadingMessage(null);
    setIsLoading(false);
    setIsProcessing(false);
  }, []);

  return {
    bmpFiles,
    isLoading,
    isProcessing,
    loadingMessage,
    error,
    success,
    failedFiles,
    loadBmpFiles,
    removeBmpFile,
    processBmpToPdf,
    reset,
  };
};
