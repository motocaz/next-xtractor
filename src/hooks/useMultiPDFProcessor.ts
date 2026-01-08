"use client";

import { useState, useCallback } from "react";

export interface UseMultiPDFProcessorReturn {
  pdfFiles: File[];
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;

  loadPDFs: (files: File[]) => void;
  removePDF: (index: number) => void;
  reset: () => void;

  setIsProcessing: (value: boolean) => void;
  setLoadingMessage: (value: string | null) => void;
  setError: (value: string | null) => void;
  setSuccess: (value: string | null) => void;
}

export const useMultiPDFProcessor = (): UseMultiPDFProcessorReturn => {
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadPDFs = useCallback((files: File[]) => {
    setPdfFiles((prev) => {
      const newFiles = [...prev];
      for (const file of files) {
        if (
          !newFiles.some((f) => f.name === file.name && f.size === file.size)
        ) {
          newFiles.push(file);
        }
      }
      return newFiles;
    });
    setError(null);
    setSuccess(null);
  }, []);

  const removePDF = useCallback((index: number) => {
    setPdfFiles((prev) => prev.filter((_, i) => i !== index));
    setError(null);
    setSuccess(null);
  }, []);

  const reset = useCallback(() => {
    setPdfFiles([]);
    setIsProcessing(false);
    setLoadingMessage(null);
    setError(null);
    setSuccess(null);
  }, []);

  return {
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
  };
};
