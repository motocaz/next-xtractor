"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";
import type { PDFDocument as PDFDocumentType } from "pdf-lib";
import { usePDFProcessor } from "@/hooks/usePDFProcessor";
import { loadPDFWithPDFJSFromBuffer } from "@/lib/pdf/pdfjs-loader";
import {
  readFileAsArrayBuffer,
  saveAndDownloadPDF,
} from "@/lib/pdf/file-utils";
import { renderPageAsImage } from "@/lib/pdf/canvas-utils";
import { applyRedactions as applyRedactionsToPDF } from "../lib/redact-logic";
import type {
  RedactionRect,
  PageRedactions,
  UseRedactPDFReturn,
} from "../types";

const CANVAS_SCALE = 2.5;

export const useRedactPDF = (): UseRedactPDFReturn => {
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [pageRedactions, setPageRedactions] = useState<PageRedactions>({});
  const [currentPageImageUrl, setCurrentPageImageUrl] = useState<string | null>(
    null,
  );
  const [, setOriginalPdfBytes] = useState<ArrayBuffer | null>(null);
  const pdfJsDocRef = useRef<PDFDocumentProxy | null>(null);
  const pdfDocRef = useRef<PDFDocumentType | null>(null);

  const {
    pdfDoc,
    pdfFile,
    isLoadingPDF,
    pdfError,
    isProcessing,
    loadingMessage,
    error,
    success,
    totalPages,
    loadPDF: baseLoadPDF,
    resetPDF: baseResetPDF,
    setIsProcessing,
    setLoadingMessage,
    setError,
    setSuccess,
    resetProcessing,
  } = usePDFProcessor();

  useEffect(() => {
    pdfDocRef.current = pdfDoc;
  }, [pdfDoc]);

  const loadPDF = useCallback(
    async (file: File) => {
      setPageRedactions({});
      setCurrentPageNum(1);
      setCurrentPageImageUrl(null);
      setOriginalPdfBytes(null);
      pdfJsDocRef.current = null;

      setLoadingMessage("Loading PDF...");
      setIsProcessing(true);
      setError(null);
      setSuccess(null);

      try {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        setOriginalPdfBytes(arrayBuffer);

        const pdfJsDoc = await loadPDFWithPDFJSFromBuffer(arrayBuffer);
        pdfJsDocRef.current = pdfJsDoc;

        await baseLoadPDF(file);

        if (pdfJsDoc.numPages > 0) {
          setCurrentPageNum(1);
          const imageUrl = await renderPageAsImage(pdfJsDoc, 1, CANVAS_SCALE);
          setCurrentPageImageUrl(imageUrl);
        }

        setSuccess(
          "PDF loaded successfully. Draw rectangles to redact content.",
        );
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Could not load PDF. It may be corrupt or password-protected.",
        );
      } finally {
        setIsProcessing(false);
        setLoadingMessage(null);
      }
    },
    [baseLoadPDF, setError, setSuccess, setLoadingMessage, setIsProcessing],
  );

  const changePage = useCallback(
    async (offset: number) => {
      if (!pdfJsDocRef.current) return;

      const newPageNum = currentPageNum + offset;
      if (newPageNum < 1 || newPageNum > pdfJsDocRef.current.numPages) {
        return;
      }

      setCurrentPageNum(newPageNum);
      setLoadingMessage(`Rendering page ${newPageNum}...`);

      try {
        const imageUrl = await renderPageAsImage(
          pdfJsDocRef.current,
          newPageNum,
          CANVAS_SCALE,
        );
        setCurrentPageImageUrl(imageUrl);
        setLoadingMessage(null);
      } catch (err) {
        console.error("Error rendering page:", err);
        setError("Failed to render page.");
        setLoadingMessage(null);
      }
    },
    [currentPageNum, setError, setLoadingMessage],
  );

  const addRedaction = useCallback(
    (rect: RedactionRect) => {
      setPageRedactions((prev) => {
        const currentRedactions = prev[currentPageNum] || [];
        return {
          ...prev,
          [currentPageNum]: [...currentRedactions, rect],
        };
      });
    },
    [currentPageNum],
  );

  const removeRedaction = useCallback((pageNum: number, index: number) => {
    setPageRedactions((prev) => {
      const currentRedactions = prev[pageNum] || [];
      if (index < 0 || index >= currentRedactions.length) {
        return prev;
      }
      const newRedactions = [...currentRedactions];
      newRedactions.splice(index, 1);

      if (newRedactions.length === 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [pageNum]: _, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [pageNum]: newRedactions,
      };
    });
  }, []);

  const clearPageRedactions = useCallback((pageNum: number) => {
    setPageRedactions((prev) => {
      const newRedactions = { ...prev };
      delete newRedactions[pageNum];
      return newRedactions;
    });
  }, []);

  const clearAllRedactions = useCallback(() => {
    setPageRedactions({});
  }, []);

  const applyRedactions = useCallback(async () => {
    if (!pdfDocRef.current) {
      setError("Please load a PDF file first.");
      return;
    }

    const hasRedactions = Object.keys(pageRedactions).some(
      (pageNum) => pageRedactions[Number.parseInt(pageNum, 10)]?.length > 0,
    );

    if (!hasRedactions) {
      setError("Please draw at least one redaction rectangle before applying.");
      return;
    }

    setIsProcessing(true);
    setLoadingMessage("Applying redactions...");
    setError(null);
    setSuccess(null);

    try {
      const pdfBytes = await pdfDocRef.current.save();
      const clonedPdfDoc = await PDFDocument.load(pdfBytes);

      await applyRedactionsToPDF(clonedPdfDoc, pageRedactions, CANVAS_SCALE);

      const finalPdfBytes = await clonedPdfDoc.save();
      const fileName = pdfFile?.name || "redacted.pdf";
      saveAndDownloadPDF(finalPdfBytes, fileName);

      setSuccess("Redactions applied successfully! Your download has started.");
    } catch (err) {
      console.error("Error applying redactions:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while applying redactions.",
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfDocRef,
    pageRedactions,
    pdfFile,
    setError,
    setSuccess,
    setIsProcessing,
    setLoadingMessage,
  ]);

  const reset = useCallback(() => {
    setPageRedactions({});
    setCurrentPageNum(1);
    setCurrentPageImageUrl(null);
    setOriginalPdfBytes(null);
    pdfJsDocRef.current = null;
    pdfDocRef.current = null;
    baseResetPDF();
    resetProcessing();
  }, [baseResetPDF, resetProcessing]);

  const effectiveTotalPages = pdfJsDocRef.current?.numPages || totalPages || 0;

  return {
    pdfFile,
    pdfDoc,
    isLoadingPDF: isLoadingPDF || isProcessing,
    pdfError: pdfError || error,
    totalPages: effectiveTotalPages,
    isProcessing,
    loadingMessage,
    error,
    success,
    currentPageNum,
    pageRedactions,
    currentPageImageUrl,
    canvasScale: CANVAS_SCALE,
    loadPDF,
    resetPDF: reset,
    changePage,
    addRedaction,
    removeRedaction,
    clearPageRedactions,
    clearAllRedactions,
    applyRedactions,
    setError,
  };
};
