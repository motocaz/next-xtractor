"use client";

import { useState, useCallback, useEffect } from "react";
import {
  editPDFMetadata,
  extractCustomMetadataFields,
} from "../lib/edit-metadata-logic";
import { saveAndDownloadPDF } from "@/lib/pdf/file-utils";
import { usePDFProcessor } from "@/hooks/usePDFProcessor";
import type {
  UseEditMetadataReturn,
  PDFMetadata,
  CustomMetadataField,
} from "../types";

const formatDateForInput = (date: Date | undefined): string => {
  if (!date) return "";
  const pad = (num: number) => num.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const defaultMetadata: PDFMetadata = {
  title: "",
  author: "",
  subject: "",
  keywords: "",
  creator: "",
  producer: "",
  creationDate: "",
  modificationDate: "",
};

export const useEditMetadata = (): UseEditMetadataReturn => {
  const [metadata, setMetadata] = useState<PDFMetadata>(defaultMetadata);
  const [customFields, setCustomFields] = useState<CustomMetadataField[]>([]);

  const {
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfDoc,
    pdfFile,
    isLoadingPDF,
    pdfError,
    loadPDF: baseLoadPDF,
    resetPDF: baseResetPDF,
    totalPages,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
    resetProcessing,
  } = usePDFProcessor();

  useEffect(() => {
    if (!pdfDoc || isLoadingPDF || pdfError) return;

    try {
      const title = pdfDoc.getTitle() || "";
      const author = pdfDoc.getAuthor() || "";
      const subject = pdfDoc.getSubject() || "";
      const keywords = pdfDoc.getKeywords() || [];
      const creator = pdfDoc.getCreator() || "";
      const producer = pdfDoc.getProducer() || "";
      const creationDate = pdfDoc.getCreationDate();
      const modificationDate = pdfDoc.getModificationDate();

      setMetadata({
        title,
        author,
        subject,
        keywords: Array.isArray(keywords)
          ? keywords.join(", ")
          : keywords || "",
        creator,
        producer,
        creationDate: formatDateForInput(creationDate),
        modificationDate: formatDateForInput(modificationDate),
      });

      const customFieldsMap = extractCustomMetadataFields(pdfDoc);
      const customFieldsList: CustomMetadataField[] = Array.from(
        customFieldsMap.entries()
      ).map(([key, value]) => ({ key, value }));

      setCustomFields(customFieldsList);
    } catch (err) {
      console.error("Error loading metadata from PDF:", err);
    }
  }, [pdfDoc, isLoadingPDF, pdfError]);

  const updateMetadataField = useCallback(
    (field: keyof PDFMetadata, value: string) => {
      setMetadata((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const addCustomField = useCallback(() => {
    setCustomFields((prev) => [...prev, { key: "", value: "" }]);
  }, []);

  const removeCustomField = useCallback((index: number) => {
    setCustomFields((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateCustomField = useCallback(
    (index: number, key: string, value: string) => {
      setCustomFields((prev) =>
        prev.map((field, i) => (i === index ? { key, value } : field))
      );
    },
    []
  );

  const loadPDF = useCallback(
    async (file: File) => {
      await baseLoadPDF(file);
    },
    [baseLoadPDF]
  );

  const processMetadata = useCallback(async () => {
    if (!pdfDoc) {
      setError("Please upload a PDF file first.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage("Updating metadata...");

    try {
      const updatedPdfDoc = await editPDFMetadata(
        pdfDoc,
        metadata,
        customFields
      );
      const pdfBytes = await updatedPdfDoc.save();
      saveAndDownloadPDF(pdfBytes, pdfFile?.name);
      setSuccess("Metadata updated successfully!");
    } catch (err) {
      console.error("Error updating metadata:", err);
      setError(
        err instanceof Error
          ? `Failed to update metadata: ${err.message}`
          : "Could not update metadata. Please check that date formats are correct."
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfDoc,
    metadata,
    customFields,
    pdfFile,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
  ]);

  const reset = useCallback(() => {
    setMetadata(defaultMetadata);
    setCustomFields([]);
    resetProcessing();
    baseResetPDF();
  }, [resetProcessing, baseResetPDF]);

  return {
    metadata,
    customFields,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    updateMetadataField,
    addCustomField,
    removeCustomField,
    updateCustomField,
    loadPDF,
    processMetadata,
    reset,
  };
};
