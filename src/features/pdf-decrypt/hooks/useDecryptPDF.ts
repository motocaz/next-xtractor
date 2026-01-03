"use client";

import { useState, useCallback } from "react";
import { decryptPDF } from "../lib/decrypt-logic";
import { downloadFile } from "@/lib/pdf/file-utils";
import { usePDFProcessor } from "@/hooks/usePDFProcessor";
import type { UseDecryptPDFReturn } from "../types";

export const useDecryptPDF = (): UseDecryptPDFReturn => {
  const [password, setPassword] = useState<string>("");

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
  } = usePDFProcessor(true);

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
  }, [
    pdfFile,
    password,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
  ]);

  const reset = useCallback(() => {
    setPassword("");
    resetProcessing();
    resetPDF();
  }, [resetProcessing, resetPDF]);

  return {
    password,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    setPassword,
    loadPDF,
    decryptPDF: decrypt,
    reset,
  };
};
