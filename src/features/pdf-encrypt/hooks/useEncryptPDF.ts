"use client";

import { useState, useCallback } from "react";
import { encryptPDF } from "../lib/encrypt-logic";
import { downloadFile } from "@/lib/pdf/file-utils";
import { usePDFProcessor } from "@/hooks/usePDFProcessor";
import type { UseEncryptPDFReturn } from "../types";

export const useEncryptPDF = (): UseEncryptPDFReturn => {
  const [userPassword, setUserPassword] = useState<string>("");
  const [ownerPassword, setOwnerPassword] = useState<string>("");

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

  const encrypt = useCallback(async () => {
    if (!pdfFile) {
      setError("Please upload a PDF file first.");
      return;
    }

    if (!userPassword || userPassword.trim().length === 0) {
      setError("Please enter a user password.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage("Initializing encryption...");

    try {
      setLoadingMessage("Reading PDF...");
      setLoadingMessage("Encrypting PDF with 256-bit AES...");

      const blob = await encryptPDF(pdfFile, {
        userPassword,
        ownerPassword: ownerPassword || undefined,
      });

      setLoadingMessage("Preparing download...");
      downloadFile(blob, pdfFile.name);

      const hasDistinctOwnerPassword =
        ownerPassword && ownerPassword !== userPassword;
      let successMessage = "PDF encrypted successfully with 256-bit AES!";
      if (!hasDistinctOwnerPassword) {
        successMessage +=
          " Note: Without a separate owner password, the PDF has no usage restrictions.";
      }

      setSuccess(successMessage);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error encrypting PDF:", err);

      if (err.message?.includes("password")) {
        setError("An error occurred with the password. Please try again.");
      } else {
        setError(
          `An error occurred: ${err.message || "The PDF might be corrupted."}`,
        );
      }
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfFile,
    userPassword,
    ownerPassword,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
  ]);

  const reset = useCallback(() => {
    setUserPassword("");
    setOwnerPassword("");
    resetProcessing();
    resetPDF();
  }, [resetProcessing, resetPDF]);

  return {
    userPassword,
    ownerPassword,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    setUserPassword,
    setOwnerPassword,
    loadPDF,
    encryptPDF: encrypt,
    reset,
  };
};
