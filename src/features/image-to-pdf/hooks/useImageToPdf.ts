"use client";

import { useState, useCallback } from "react";
import {
  detectImageTypes,
  convertSingleTypeImages,
  convertMixedTypeImages,
} from "../lib/image-to-pdf-logic";
import { saveAndDownloadPDF } from "@/lib/pdf/file-utils";
import type { ImageFileInfo, UseImageToPdfReturn } from "../types";

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/bmp",
  "image/tiff",
  "image/tif",
  "image/svg+xml",
]);
const ACCEPTED_EXTENSIONS = [".heic", ".heif"];

const isValidImageFile = (file: File): boolean => {
  const type = file.type || "";
  const lowerName = file.name.toLowerCase();

  if (ACCEPTED_TYPES.has(type)) {
    return true;
  }

  if (ACCEPTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext))) {
    return true;
  }

  return false;
};

const determineImageType = (file: File): string => {
  const type = file.type || "";
  const lowerName = file.name.toLowerCase();

  if (
    (!type || !ACCEPTED_TYPES.has(type)) &&
    (lowerName.endsWith(".heic") || lowerName.endsWith(".heif"))
  ) {
    return "image/heic";
  }

  return type;
};

export const useImageToPdf = (): UseImageToPdfReturn => {
  const [imageFiles, setImageFiles] = useState<ImageFileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [failedFiles, setFailedFiles] = useState<string[]>([]);
  const [quality, setQuality] = useState<number>(0.9);

  const loadImageFiles = useCallback(async (files: File[]) => {
    if (!files || files.length === 0) {
      setError("Please select at least one image file.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage("Validating image files...");

    try {
      const validFiles: ImageFileInfo[] = [];
      const invalidFiles: string[] = [];

      for (const file of files) {
        if (!isValidImageFile(file)) {
          invalidFiles.push(file.name);
          continue;
        }

        const id = `${file.name}-${Date.now()}-${Math.random()}`;
        const actualType = determineImageType(file);

        validFiles.push({
          id,
          file,
          fileName: file.name,
          fileSize: file.size,
          type: actualType,
        });
      }

      if (invalidFiles.length > 0) {
        setError(
          `The following files are not valid image files: ${invalidFiles.join(
            ", "
          )}`
        );
      }

      if (validFiles.length === 0) {
        setError(
          "No valid image files were found. Please select image files (JPG, PNG, WebP, BMP, TIFF, SVG, or HEIC)."
        );
      } else {
        setImageFiles((prev) => [...prev, ...validFiles]);
        if (validFiles.length > 0 && invalidFiles.length === 0) {
          setSuccess(`${validFiles.length} image file(s) loaded successfully.`);
        }
      }
    } catch (err) {
      console.error("Error loading image files:", err);
      setError(
        err instanceof Error
          ? `Failed to load image files: ${err.message}`
          : "Failed to load image files. Please check your files."
      );
    } finally {
      setIsLoading(false);
      setLoadingMessage(null);
    }
  }, []);

  const removeImageFile = useCallback((id: string) => {
    setImageFiles((prev) => prev.filter((file) => file.id !== id));
    setError(null);
    setSuccess(null);
  }, []);

  const reorderFiles = useCallback((activeId: string, overId: string) => {
    if (activeId === overId) return;

    setImageFiles((prev) => {
      const oldIndex = prev.findIndex((file) => file.id === activeId);
      const newIndex = prev.findIndex((file) => file.id === overId);

      if (oldIndex === -1 || newIndex === -1) return prev;

      const newFiles = [...prev];
      const [moved] = newFiles.splice(oldIndex, 1);
      newFiles.splice(newIndex, 0, moved);

      return newFiles;
    });
  }, []);

  const processImageToPdf = useCallback(async () => {
    if (imageFiles.length === 0) {
      setError("Please upload at least one image file.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setFailedFiles([]);
    setLoadingMessage("Converting images to PDF...");

    try {
      const files = imageFiles.map((fileInfo) => fileInfo.file);
      const filesByType = detectImageTypes(files);
      const types = Array.from(filesByType.keys());

      let result;

      if (types.length === 1) {
        const type = types[0];
        setLoadingMessage(`Converting ${type} images to PDF...`);
        result = await convertSingleTypeImages(files, type);
      } else {
        setLoadingMessage("Converting mixed image types to PDF...");
        result = await convertMixedTypeImages(files, quality);
      }

      const pdfBytes = await result.pdfDoc.save();
      const firstFileName = imageFiles[0]?.fileName || "converted";
      const baseName =
        firstFileName.replace(
          /\.(jpg|jpeg|png|gif|bmp|webp|tiff|tif|svg|heic|heif)$/i,
          ""
        ) || "converted";

      saveAndDownloadPDF(pdfBytes, baseName);

      if (result.failedFiles.length > 0) {
        setFailedFiles(result.failedFiles);
      }

      let successMessage = `Successfully converted ${result.successCount} image(s) to PDF.`;
      if (result.failedFiles.length > 0) {
        successMessage += ` ${result.failedFiles.length} file(s) could not be processed.`;
      }
      setSuccess(successMessage);
    } catch (err) {
      console.error("Image to PDF conversion error:", err);
      setError(
        err instanceof Error
          ? `An error occurred while converting: ${err.message}`
          : "An error occurred while converting images to PDF. One of the files may be invalid."
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [imageFiles, quality]);

  const reset = useCallback(() => {
    setImageFiles([]);
    setError(null);
    setSuccess(null);
    setFailedFiles([]);
    setLoadingMessage(null);
    setIsLoading(false);
    setIsProcessing(false);
    setQuality(0.9);
  }, []);

  return {
    imageFiles,
    isLoading,
    isProcessing,
    loadingMessage,
    error,
    success,
    failedFiles,
    quality,
    loadImageFiles,
    removeImageFile,
    reorderFiles,
    setQuality,
    processImageToPdf,
    reset,
  };
};
