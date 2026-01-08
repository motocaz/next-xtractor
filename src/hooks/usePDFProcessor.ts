"use client";

import { useState, useCallback } from "react";
import { usePDFLoader } from "./usePDFLoader";

export interface UsePDFProcessorReturn {
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;

  pdfDoc: ReturnType<typeof usePDFLoader>["pdfDoc"];
  pdfFile: File | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  loadPDF: (file: File) => Promise<void>;
  resetPDF: () => void;

  totalPages: number;

  setIsProcessing: (value: boolean) => void;
  setLoadingMessage: (value: string | null) => void;
  setError: (value: string | null) => void;
  setSuccess: (value: string | null) => void;

  resetProcessing: () => void;
}

export const usePDFProcessor = (
  allowEncrypted = false,
): UsePDFProcessorReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    pdfDoc,
    pdfFile,
    isLoading: isLoadingPDF,
    error: pdfError,
    loadPDF,
    reset: resetPDF,
  } = usePDFLoader(allowEncrypted);

  const totalPages = pdfDoc ? pdfDoc.getPageCount() : 0;

  const resetProcessing = useCallback(() => {
    setError(null);
    setSuccess(null);
    setLoadingMessage(null);
    setIsProcessing(false);
  }, []);

  return {
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
    setLoadingMessage,
    setError,
    setSuccess,
    resetProcessing,
  };
};
