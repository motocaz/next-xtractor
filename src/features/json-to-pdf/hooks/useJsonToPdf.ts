"use client";

import { useState, useCallback } from "react";
import JSZip from "jszip";
import { convertJSONsToPDFs } from "../lib/json-to-pdf-logic";
import { downloadFile, formatBytes } from "@/lib/pdf/file-utils";
import type { UseJsonToPdfReturn, JsonFileInfo } from "../types";

export const useJsonToPdf = (): UseJsonToPdfReturn => {
  const [jsonFiles, setJsonFiles] = useState<JsonFileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadJsonFiles = useCallback(async (files: File[]) => {
    if (!files || files.length === 0) {
      setError("Please select at least one JSON file.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage("Validating JSON files...");

    try {
      const validFiles: JsonFileInfo[] = [];
      const invalidFiles: string[] = [];

      for (const file of files) {
        const isJson =
          file.type === "application/json" ||
          file.name.toLowerCase().endsWith(".json");

        if (!isJson) {
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
          `The following files are not valid JSON files: ${invalidFiles.join(", ")}`,
        );
      }

      if (validFiles.length === 0) {
        setError("No valid JSON files were found. Please select JSON files.");
      } else {
        setJsonFiles((prev) => [...prev, ...validFiles]);
        if (validFiles.length > 0 && invalidFiles.length === 0) {
          setSuccess(`${validFiles.length} JSON file(s) loaded successfully.`);
        }
      }
    } catch (err) {
      console.error("Error loading JSON files:", err);
      setError(
        err instanceof Error
          ? `Failed to load JSON files: ${err.message}`
          : "Failed to load JSON files. Please check your files.",
      );
    } finally {
      setIsLoading(false);
      setLoadingMessage(null);
    }
  }, []);

  const removeJsonFile = useCallback((id: string) => {
    setJsonFiles((prev) => prev.filter((file) => file.id !== id));
    setError(null);
    setSuccess(null);
  }, []);

  const processJsonToPdf = useCallback(async () => {
    if (jsonFiles.length === 0) {
      setError("Please upload at least one JSON file.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage("Reading files...");

    try {
      setLoadingMessage("Converting JSONs to PDFs...");

      const files = jsonFiles.map((fileInfo) => fileInfo.file);
      const pdfFiles = await convertJSONsToPDFs(files);

      if (pdfFiles.length === 0) {
        setError("No PDFs were generated from the JSON files.");
        setIsProcessing(false);
        setLoadingMessage(null);
        return;
      }

      setLoadingMessage("Creating ZIP file...");

      const zip = new JSZip();
      let totalSize = 0;

      for (const pdfFile of pdfFiles) {
        const pdfName = pdfFile.name.replace(/\.json$/i, ".pdf");
        const uint8Array = new Uint8Array(pdfFile.data);
        zip.file(pdfName, uint8Array);
        totalSize += pdfFile.data.byteLength;
      }

      setLoadingMessage("Preparing download...");

      const zipBlob = await zip.generateAsync({ type: "blob" });

      const baseName =
        jsonFiles[0]?.fileName.replace(/\.json$/i, "") || "jsons-to-pdf";
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const zipFileName = `${timestamp}_${baseName}.zip`;

      downloadFile(zipBlob, undefined, zipFileName);

      const successMessage = `Conversion completed! ${pdfFiles.length} PDF(s) in zip file (${formatBytes(totalSize)}). Download started.`;
      setSuccess(successMessage);

      setJsonFiles([]);
    } catch (err) {
      console.error("Error converting JSONs to PDFs:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while converting JSONs to PDFs.",
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [jsonFiles]);

  const reset = useCallback(() => {
    setJsonFiles([]);
    setIsLoading(false);
    setIsProcessing(false);
    setLoadingMessage(null);
    setError(null);
    setSuccess(null);
  }, []);

  return {
    jsonFiles,
    isLoading,
    isProcessing,
    loadingMessage,
    error,
    success,
    loadJsonFiles,
    removeJsonFile,
    processJsonToPdf,
    reset,
  };
};
