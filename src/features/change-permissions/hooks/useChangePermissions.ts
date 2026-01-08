"use client";

import { useState, useCallback } from "react";
import { changePermissions } from "../lib/change-permissions-logic";
import { downloadFile } from "@/lib/pdf/file-utils";
import { usePDFProcessor } from "@/hooks/usePDFProcessor";
import type { UseChangePermissionsReturn, PDFPermissions } from "../types";

const defaultPermissions: PDFPermissions = {
  allowPrinting: true,
  allowCopying: true,
  allowModifying: true,
  allowAnnotating: true,
  allowFillingForms: true,
  allowDocumentAssembly: true,
  allowPageExtraction: true,
};

export const useChangePermissions = (): UseChangePermissionsReturn => {
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newUserPassword, setNewUserPassword] = useState<string>("");
  const [newOwnerPassword, setNewOwnerPassword] = useState<string>("");
  const [permissions, setPermissions] =
    useState<PDFPermissions>(defaultPermissions);

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

  const processPermissions = useCallback(async () => {
    if (!pdfFile) {
      setError("Please upload a PDF file first.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage("Initializing...");

    try {
      setLoadingMessage("Reading PDF...");
      setLoadingMessage("Processing PDF permissions...");

      const blob = await changePermissions(pdfFile, {
        currentPassword,
        newUserPassword,
        newOwnerPassword,
        permissions,
      });

      setLoadingMessage("Preparing download...");
      downloadFile(blob, pdfFile.name);

      const shouldEncrypt = newUserPassword || newOwnerPassword;
      const successMsg = shouldEncrypt
        ? "PDF permissions changed successfully!"
        : "PDF decrypted successfully! All encryption and restrictions removed.";

      setSuccess(successMsg);
    } catch (err) {
      console.error("Error changing PDF permissions:", err);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((err as any)?.xa === 44) {
        setError(
          "Incorrect password. The current password you entered is incorrect. Please verify and try again.",
        );
        return;
      }

      if (err instanceof Error) {
        if (err.message === "INVALID_PASSWORD") {
          setError(
            "Incorrect password. The current password you entered is incorrect. Please verify and try again.",
          );
        } else {
          setError(
            `An error occurred: ${err.message || "The PDF might be corrupted or password protected."}`,
          );
        }
      } else {
        setError(
          "An error occurred while processing the PDF. Please try again.",
        );
      }
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfFile,
    currentPassword,
    newUserPassword,
    newOwnerPassword,
    permissions,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
  ]);

  const setPermission = useCallback(
    (key: keyof PDFPermissions, value: boolean) => {
      setPermissions((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const reset = useCallback(() => {
    setCurrentPassword("");
    setNewUserPassword("");
    setNewOwnerPassword("");
    setPermissions(defaultPermissions);
    resetProcessing();
    resetPDF();
  }, [resetProcessing, resetPDF]);

  return {
    currentPassword,
    newUserPassword,
    newOwnerPassword,
    permissions,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    setCurrentPassword,
    setNewUserPassword,
    setNewOwnerPassword,
    setPermission,
    loadPDF,
    processPermissions,
    reset,
  };
};
