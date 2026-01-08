"use client";

import { useState, useCallback } from "react";
import { jpgToPdf } from "../lib/jpg-to-pdf-logic";
import { handleImageToPdfResult } from "@/lib/pdf/image-to-pdf-utils";
import type { JpgFileInfo, UseJpgToPdfReturn } from "../types";

export const useJpgToPdf = (): UseJpgToPdfReturn => {
  const [jpgFiles, setJpgFiles] = useState<JpgFileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [failedFiles, setFailedFiles] = useState<string[]>([]);

  const loadJpgFiles = useCallback(async (files: File[]) => {
    if (!files || files.length === 0) {
      setError("Please select at least one JPG file.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage("Validating JPG files...");

    try {
      const validFiles: JpgFileInfo[] = [];
      const invalidFiles: string[] = [];

      for (const file of files) {
        const isJpg =
          file.type === "image/jpeg" ||
          file.type === "image/jpg" ||
          file.name.toLowerCase().endsWith(".jpg") ||
          file.name.toLowerCase().endsWith(".jpeg");

        if (!isJpg) {
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
          `The following files are not valid JPG images: ${invalidFiles.join(", ")}`,
        );
      }

      if (validFiles.length === 0) {
        setError(
          "No valid JPG files were found. Please select JPG image files.",
        );
      } else {
        setJpgFiles((prev) => [...prev, ...validFiles]);
        if (validFiles.length > 0 && invalidFiles.length === 0) {
          setSuccess(`${validFiles.length} JPG file(s) loaded successfully.`);
        }
      }
    } catch (err) {
      console.error("Error loading JPG files:", err);
      setError(
        err instanceof Error
          ? `Failed to load JPG files: ${err.message}`
          : "Failed to load JPG files. Please check your files.",
      );
    } finally {
      setIsLoading(false);
      setLoadingMessage(null);
    }
  }, []);

  const removeJpgFile = useCallback((id: string) => {
    setJpgFiles((prev) => prev.filter((file) => file.id !== id));
    setError(null);
    setSuccess(null);
  }, []);

  const processJpgToPdf = useCallback(async () => {
    if (jpgFiles.length === 0) {
      setError("Please upload at least one JPG file.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setFailedFiles([]);
    setLoadingMessage("Converting JPG to PDF...");

    try {
      const files = jpgFiles.map((fileInfo) => fileInfo.file);
      const result = await jpgToPdf(files);

      await handleImageToPdfResult({
        result,
        firstFileName: jpgFiles[0]?.fileName || "converted",
        extensionPattern: /\.(jpg|jpeg)$/i,
        stateSetters: {
          setFailedFiles,
          setSuccess,
        },
      });
    } catch (err) {
      console.error("JPG to PDF conversion error:", err);
      setError(
        err instanceof Error
          ? `An error occurred while converting: ${err.message}`
          : "An error occurred while converting JPG to PDF. One of the files may be invalid.",
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [jpgFiles]);

  const reset = useCallback(() => {
    setJpgFiles([]);
    setError(null);
    setSuccess(null);
    setFailedFiles([]);
    setLoadingMessage(null);
    setIsLoading(false);
    setIsProcessing(false);
  }, []);

  return {
    jpgFiles,
    isLoading,
    isProcessing,
    loadingMessage,
    error,
    success,
    failedFiles,
    loadJpgFiles,
    removeJpgFile,
    processJpgToPdf,
    reset,
  };
};
