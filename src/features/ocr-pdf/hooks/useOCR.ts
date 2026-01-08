"use client";

import { useState, useCallback, useRef } from "react";
import { usePDFProcessor } from "@/hooks/usePDFProcessor";
import { processOCR } from "../lib/ocr-logic";
import { saveAndDownloadPDF, downloadFile } from "@/lib/pdf/file-utils";
import type { UseOCRReturn, OCRResolution, WhitelistPreset } from "../types";

const whitelistPresets: Record<string, string> = {
  alphanumeric:
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?-'\"",
  "numbers-currency": "0123456789$€£¥.,- ",
  "letters-only": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ",
  "numbers-only": "0123456789",
  invoice: "0123456789$.,/-#: ",
  forms:
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,()-_/@#:",
};

export const useOCR = (): UseOCRReturn => {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [resolution, setResolution] = useState<OCRResolution>("3.0");
  const [binarize, setBinarize] = useState<boolean>(false);
  const [whitelist, setWhitelist] = useState<string>("");
  const [whitelistPreset, setWhitelistPreset] = useState<WhitelistPreset>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [searchablePdfBytes, setSearchablePdfBytes] =
    useState<Uint8Array | null>(null);
  const [progressLog, setProgressLog] = useState<string[]>([]);
  const copyButtonTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfDoc,
    pdfFile,
    isLoadingPDF,
    pdfError,
    loadPDF,
    resetPDF,
    totalPages,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
    resetProcessing,
  } = usePDFProcessor();

  const runOCR = useCallback(async () => {
    if (!pdfFile) {
      setError("Please upload a PDF file first.");
      return;
    }

    if (selectedLanguages.length === 0) {
      setError("Please select at least one language for OCR.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setProgressLog([]);
    setExtractedText("");
    setSearchablePdfBytes(null);

    try {
      let finalWhitelist = whitelist;
      if (whitelistPreset && whitelistPreset !== "custom") {
        const presetValue = whitelistPresets[whitelistPreset];
        if (presetValue) {
          finalWhitelist = presetValue;
        }
      }

      const result = await processOCR({
        file: pdfFile,
        selectedLanguages,
        resolution,
        binarize,
        whitelist: finalWhitelist,
        onProgress: (progress) => {
          setLoadingMessage(progress.status);
          setProgressLog((prev) => [...prev, progress.status]);
        },
      });

      setSearchablePdfBytes(result.searchablePdfBytes);
      setExtractedText(result.extractedText);
      setSuccess("OCR completed successfully!");
    } catch (err) {
      console.error("OCR Error:", err);
      setError(
        err instanceof Error
          ? `OCR Error: ${err.message}`
          : "An error occurred during the OCR process. The worker may have failed to load. Please try again.",
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfFile,
    selectedLanguages,
    resolution,
    binarize,
    whitelist,
    whitelistPreset,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
  ]);

  const copyText = useCallback(async () => {
    if (!extractedText) return;

    try {
      await navigator.clipboard.writeText(extractedText);
      setSuccess("Text copied to clipboard!");

      if (copyButtonTimeoutRef.current) {
        clearTimeout(copyButtonTimeoutRef.current);
      }

      copyButtonTimeoutRef.current = setTimeout(() => {
        setSuccess(null);
      }, 2000);
    } catch {
      setError("Failed to copy text to clipboard.");
    }
  }, [extractedText, setSuccess, setError]);

  const downloadText = useCallback(() => {
    if (!extractedText || !pdfFile) return;

    const blob = new Blob([extractedText], { type: "text/plain" });
    downloadFile(blob, pdfFile.name);
  }, [extractedText, pdfFile]);

  const downloadSearchablePDF = useCallback(() => {
    if (!searchablePdfBytes || !pdfFile) return;

    saveAndDownloadPDF(searchablePdfBytes, pdfFile.name);
  }, [searchablePdfBytes, pdfFile]);

  const reset = useCallback(() => {
    setSelectedLanguages([]);
    setResolution("3.0");
    setBinarize(false);
    setWhitelist("");
    setWhitelistPreset("");
    setExtractedText("");
    setSearchablePdfBytes(null);
    setProgressLog([]);
    resetProcessing();
    resetPDF();

    if (copyButtonTimeoutRef.current) {
      clearTimeout(copyButtonTimeoutRef.current);
      copyButtonTimeoutRef.current = null;
    }
  }, [resetProcessing, resetPDF]);

  return {
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    loadPDF,
    resetPDF,

    selectedLanguages,
    resolution,
    binarize,
    whitelist,
    whitelistPreset,
    extractedText,
    searchablePdfBytes,

    isProcessing,
    loadingMessage,
    error,
    success,
    progressLog,

    setSelectedLanguages,
    setResolution,
    setBinarize,
    setWhitelist,
    setWhitelistPreset,

    runOCR,
    copyText,
    downloadText,
    downloadSearchablePDF,
    reset,
  };
};
