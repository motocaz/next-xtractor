"use client";

import { useState, useCallback, useEffect } from "react";
import { loadPDFWithPDFJS } from "@/lib/pdf/pdfjs-loader";
import { extractMetadataFromPDF } from "../lib/view-metadata-logic";
import type { ViewMetadataResult } from "../types";

export interface UseViewMetadataReturn {
  pdfFile: File | null;
  isLoading: boolean;
  loadingMessage: string | null;
  error: string | null;
  metadata: ViewMetadataResult | null;
  loadPDF: (file: File) => Promise<void>;
  reset: () => void;
}

export const useViewMetadata = (): UseViewMetadataReturn => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ViewMetadataResult | null>(null);

  const loadPDF = useCallback(async (file: File) => {
    setPdfFile(file);
    setIsLoading(true);
    setLoadingMessage("Analyzing full PDF metadata...");
    setError(null);
    setMetadata(null);

    try {
      const pdfDoc = await loadPDFWithPDFJS(file);
      const extractedMetadata = await extractMetadataFromPDF(pdfDoc);
      setMetadata(extractedMetadata);
    } catch (err) {
      console.error("Failed to view metadata:", err);
      setError(
        err instanceof Error
          ? `Could not analyze PDF: ${err.message}`
          : "Could not fully analyze the PDF. It may be corrupted or have an unusual structure."
      );
    } finally {
      setIsLoading(false);
      setLoadingMessage(null);
    }
  }, []);

  const reset = useCallback(() => {
    setPdfFile(null);
    setIsLoading(false);
    setLoadingMessage(null);
    setError(null);
    setMetadata(null);
  }, []);

  return {
    pdfFile,
    isLoading,
    loadingMessage,
    error,
    metadata,
    loadPDF,
    reset,
  };
};

