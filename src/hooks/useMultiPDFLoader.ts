"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { readFileAsArrayBuffer } from "@/lib/pdf/file-utils";

export interface PDFFileInfo {
  id: string;
  file: File;
  pdfDoc: PDFDocument;
  pageCount: number;
  fileName: string;
}

export interface UseMultiPDFLoaderOptions {
  onEncryptedFiles?: "error" | "warning";
  allowEncrypted?: boolean;
  errorMessages?: {
    noFiles?: string;
    noValidFiles?: string;
    encryptedFiles?: string;
    loadFailed?: (fileName: string) => string;
  };
}

export interface UseMultiPDFLoaderReturn {
  pdfFiles: PDFFileInfo[];
  isLoading: boolean;
  loadingMessage: string | null;
  error: string | null;
  warning: string | null;

  loadPDFs: (files: File[]) => Promise<void>;
  removePDF: (id: string) => void;
  reorderFiles: (activeId: string, overId: string) => void;
  reset: () => void;
}

const DEFAULT_ERROR_MESSAGES = {
  noFiles: "Please select at least one PDF file.",
  noValidFiles: "No valid PDF files were loaded.",
  encryptedFiles:
    "The following PDFs are password-protected and were skipped. Please use the Decrypt tool first:\n",
  loadFailed: (fileName: string) =>
    `Failed to load ${fileName}. The file may be corrupted or password-protected.`,
};

export const useMultiPDFLoader = (
  options: UseMultiPDFLoaderOptions = {},
): UseMultiPDFLoaderReturn => {
  const {
    onEncryptedFiles = "warning",
    allowEncrypted = false,
    errorMessages = {},
  } = options;

  const messages = { ...DEFAULT_ERROR_MESSAGES, ...errorMessages };

  const [pdfFiles, setPdfFiles] = useState<PDFFileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const loadPDFs = useCallback(
    async (files: File[]) => {
      if (!files || files.length === 0) {
        setError(messages.noFiles);
        return;
      }

      setIsLoading(true);
      setError(null);
      setWarning(null);
      setLoadingMessage("Loading PDF documents...");

      try {
        const pdfInfos: PDFFileInfo[] = [];
        const encryptedFiles: string[] = [];

        for (const file of files) {
          if (file.type !== "application/pdf") {
            continue;
          }

          try {
            const pdfBytes = await readFileAsArrayBuffer(file);
            const pdfDoc = await PDFDocument.load(pdfBytes, {
              ignoreEncryption: true,
            });

            if (pdfDoc.isEncrypted && !allowEncrypted) {
              encryptedFiles.push(file.name);
              continue;
            }

            const pageCount = pdfDoc.getPageCount();
            const id = `${file.name}-${Date.now()}-${Math.random()}`;

            pdfInfos.push({
              id,
              file,
              pdfDoc,
              pageCount,
              fileName: file.name,
            });
          } catch (err) {
            console.error(`Failed to load PDF ${file.name}:`, err);
            setError(messages.loadFailed(file.name));
            setIsLoading(false);
            setLoadingMessage(null);
            return;
          }
        }

        if (encryptedFiles.length > 0) {
          const encryptedMessage =
            messages.encryptedFiles + encryptedFiles.join("\n");
          if (onEncryptedFiles === "error") {
            setError(encryptedMessage);
          } else {
            setWarning(encryptedMessage);
          }
        }

        if (pdfInfos.length === 0) {
          setError(messages.noValidFiles);
        } else {
          setError(null);
          setPdfFiles((prev) => [...prev, ...pdfInfos]);
        }
      } catch (err) {
        console.error("Error loading PDFs:", err);
        setError(
          err instanceof Error
            ? `Failed to load PDFs: ${err.message}`
            : "Failed to load PDF files. They may be corrupted or password-protected.",
        );
      } finally {
        setIsLoading(false);
        setLoadingMessage(null);
      }
    },
    [onEncryptedFiles, allowEncrypted, messages],
  );

  const removePDF = useCallback((id: string) => {
    setPdfFiles((prev) => prev.filter((pdf) => pdf.id !== id));
    setError(null);
    setWarning(null);
  }, []);

  const reorderFiles = useCallback((activeId: string, overId: string) => {
    if (activeId === overId) return;

    setPdfFiles((prev) => {
      const oldIndex = prev.findIndex((pdf) => pdf.id === activeId);
      const newIndex = prev.findIndex((pdf) => pdf.id === overId);

      if (oldIndex === -1 || newIndex === -1) return prev;

      const newFiles = [...prev];
      const [moved] = newFiles.splice(oldIndex, 1);
      newFiles.splice(newIndex, 0, moved);

      return newFiles;
    });
  }, []);

  const reset = useCallback(() => {
    setPdfFiles([]);
    setError(null);
    setWarning(null);
    setLoadingMessage(null);
    setIsLoading(false);
  }, []);

  return {
    pdfFiles,
    isLoading,
    loadingMessage,
    error,
    warning,
    loadPDFs,
    removePDF,
    reorderFiles,
    reset,
  };
};
