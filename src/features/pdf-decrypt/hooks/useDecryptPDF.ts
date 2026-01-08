"use client";

import { useState, useCallback } from "react";
import { decryptPDF } from "../lib/decrypt-logic";
import { downloadFile } from "@/lib/pdf/file-utils";
import type { UseDecryptPDFReturn } from "../types";

export const useDecryptPDF = (): UseDecryptPDFReturn => {
  const [password, setPassword] = useState<string>("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadPDF = useCallback(async (file: File) => {
    if (!file || file.type !== "application/pdf") {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setPdfError("Please select a valid PDF file.");
        return;
      }
    }

    setIsLoadingPDF(true);
    setPdfError(null);
    setError(null);

    try {
      setPdfFile(file);
    } catch (err) {
      console.error("Error loading PDF:", err);
      setPdfError(
        err instanceof Error
          ? err.message
          : "Could not load PDF. It may be corrupt."
      );
    } finally {
      setIsLoadingPDF(false);
    }
  }, []);

  const decrypt = useCallback(async () => {
    if (!pdfFile) {
      setError("Please upload a PDF file first.");
      return;
    }

    if (!password) {
      setError("Please enter the PDF password.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage("Initializing decryption...");

    try {
      setLoadingMessage("Reading encrypted PDF...");
      setLoadingMessage("Decrypting PDF...");

      const blob = await decryptPDF(pdfFile, password);

      setLoadingMessage("Preparing download...");
      downloadFile(blob, pdfFile.name);

      setSuccess("PDF decrypted successfully! Your download has started.");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error decrypting PDF:", err);

      if (err.xa == 44) {
        setError("The password you entered is incorrect. Please try again.");
      } else if (err.message?.includes("password")) {
        setError("Unable to decrypt the PDF with the provided password.");
      } else {
        setError(
          `An error occurred: ${
            err.message ||
            "The password you entered is wrong or the file is corrupted."
          }`
        );
      }
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [pdfFile, password]);

  const reset = useCallback(() => {
    setPassword("");
    setPdfFile(null);
    setPdfError(null);
    setError(null);
    setSuccess(null);
    setLoadingMessage(null);
    setIsProcessing(false);
  }, []);

  return {
    password,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc: null,
    isLoadingPDF,
    pdfError,
    totalPages: 0,
    setPassword,
    loadPDF,
    decryptPDF: decrypt,
    reset,
  };
};
