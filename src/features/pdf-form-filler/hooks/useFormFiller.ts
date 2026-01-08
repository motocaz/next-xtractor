"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { PDFDocument as PDFLibDocument } from "pdf-lib";
import { usePDFProcessor } from "@/hooks/usePDFProcessor";
import { saveAndDownloadPDF } from "@/lib/pdf/file-utils";
import { extractFormFields, applyFormValues } from "../lib/form-filler-logic";
import { loadPDFForRendering, renderPDFPage } from "../lib/pdf-renderer";
import type { UseFormFillerReturn, FormField, FormFieldValue } from "../types";

export const useFormFiller = (): UseFormFillerReturn => {
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
    resetPDF,
    totalPages,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
    resetProcessing,
  } = usePDFProcessor(true);

  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [fieldValues, setFieldValues] = useState<
    Record<string, FormFieldValue>
  >({});
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [isRendering, setIsRendering] = useState(false);
  const [pdfJsDoc, setPdfJsDoc] = useState<PDFDocumentProxy | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRenderingRef = useRef(false);

  const setCanvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
  }, []);

  useEffect(() => {
    if (!pdfDoc) {
      setFormFields([]);
      setFieldValues({});
      setPdfJsDoc(null);
      return;
    }

    const extractFields = async () => {
      try {
        setLoadingMessage("Analyzing form fields...");
        const fields = extractFormFields(pdfDoc);
        setFormFields(fields);

        const initialValues: Record<string, FormFieldValue> = {};
        fields.forEach((field) => {
          initialValues[field.name] = field.value;
        });
        setFieldValues(initialValues);

        const pdfBytes = await pdfDoc.save();
        const jsDoc = await loadPDFForRendering(pdfBytes);
        setPdfJsDoc(jsDoc);
        setCurrentPage(1);
        setLoadingMessage(null);
      } catch (err) {
        console.error("Error extracting form fields:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to read PDF form data. The file may be corrupt or not a valid form.",
        );
        setLoadingMessage(null);
      }
    };

    extractFields();
  }, [pdfDoc, setLoadingMessage, setError]);

  const renderCurrentPage = useCallback(async () => {
    if (!pdfDoc || !pdfJsDoc || !canvasRef.current || isRenderingRef.current)
      return;

    isRenderingRef.current = true;
    setIsRendering(true);

    try {
      const pdfBytes = await pdfDoc.save();
      const tempPdfDoc = await PDFLibDocument.load(pdfBytes, {
        ignoreEncryption: true,
      });
      applyFormValues(tempPdfDoc, fieldValues);

      const tempPdfBytes = await tempPdfDoc.save();
      const tempPdfJsDoc = await loadPDFForRendering(tempPdfBytes);
      await renderPDFPage(tempPdfJsDoc, currentPage, canvasRef.current, zoom);
    } catch (err) {
      console.error("Error rendering page:", err);
    } finally {
      isRenderingRef.current = false;
      setIsRendering(false);
    }
  }, [pdfDoc, pdfJsDoc, fieldValues, currentPage, zoom]);

  useEffect(() => {
    if (!pdfDoc || !pdfJsDoc || !canvasRef.current) return;

    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }

    renderTimeoutRef.current = setTimeout(() => {
      renderCurrentPage();
    }, 350);

    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [fieldValues, currentPage, zoom, pdfDoc, pdfJsDoc, renderCurrentPage]);

  useEffect(() => {
    if (pdfJsDoc && canvasRef.current && pdfDoc) {
      const timer = setTimeout(() => {
        renderCurrentPage();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pdfJsDoc, pdfDoc, renderCurrentPage]);

  const updateFieldValue = useCallback(
    (name: string, value: FormFieldValue) => {
      setFieldValues((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    [],
  );

  const changePage = useCallback(
    (offset: number) => {
      if (!pdfJsDoc) return;
      const newPage = currentPage + offset;
      if (newPage > 0 && newPage <= pdfJsDoc.numPages) {
        setCurrentPage(newPage);
      }
    },
    [currentPage, pdfJsDoc],
  );

  const setZoomLevel = useCallback((factor: number) => {
    setZoom(Math.max(1, Math.min(5, factor)));
  }, []);

  const processAndDownload = useCallback(async () => {
    if (!pdfDoc || !pdfFile) {
      setError("Please upload a PDF file first.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage("Applying form data...");

    try {
      const pdfBytes = await pdfDoc.save();
      const newPdfDoc = await PDFLibDocument.load(pdfBytes, {
        ignoreEncryption: true,
      });

      applyFormValues(newPdfDoc, fieldValues);

      const newPdfBytes = await newPdfDoc.save();
      saveAndDownloadPDF(newPdfBytes, pdfFile.name);
      setSuccess("Form has been filled and downloaded.");
    } catch (err) {
      console.error("Error processing form:", err);
      setError(
        err instanceof Error ? err.message : "Failed to save the filled form.",
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfDoc,
    pdfFile,
    fieldValues,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
  ]);

  const reset = useCallback(() => {
    resetProcessing();
    resetPDF();
    setFormFields([]);
    setFieldValues({});
    setCurrentPage(1);
    setZoom(1);
    setPdfJsDoc(null);
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }
  }, [resetProcessing, resetPDF]);

  const effectiveTotalPages = pdfJsDoc?.numPages ?? totalPages;

  return {
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages: effectiveTotalPages,
    formFields,
    fieldValues,
    currentPage,
    zoom,
    isRendering,
    loadPDF: baseLoadPDF,
    updateFieldValue,
    changePage,
    setZoom: setZoomLevel,
    processAndDownload,
    setCanvasRef,
    reset,
  };
};
