"use client";

import { useState, useCallback, useEffect } from "react";
import { usePDFProcessor } from "@/hooks/usePDFProcessor";
import { saveAndDownloadPDF } from "@/lib/pdf/file-utils";
import { loadPDFWithPDFJSFromBuffer } from "@/lib/pdf/pdfjs-loader";
import type { PDFDocumentProxy } from "pdfjs-dist";
import {
  analyzePagesForBlankDetection,
  updateAnalysisWithSensitivity,
  removeBlankPages,
} from "../lib/remove-blank-pages-logic";
import type {
  UseRemoveBlankPagesReturn,
  AnalysisResult,
  PageAnalysisData,
} from "../types";

export const useRemoveBlankPages = (): UseRemoveBlankPagesReturn => {
  const [sensitivity, setSensitivity] = useState<number>(99);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCache, setAnalysisCache] = useState<PageAnalysisData[]>([]);
  const [pdfJsDocCache, setPdfJsDocCache] = useState<PDFDocumentProxy | null>(
    null,
  );

  const {
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfDoc,
    pdfFile,
    isLoadingPDF,
    pdfError,
    totalPages,
    loadPDF: baseLoadPDF,
    resetPDF,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
    resetProcessing,
  } = usePDFProcessor();

  const loadPDF = useCallback(
    async (file: File) => {
      setSensitivity(99);
      setAnalysisResult(null);
      setAnalysisCache([]);
      setPdfJsDocCache(null);
      await baseLoadPDF(file);
    },
    [baseLoadPDF],
  );

  useEffect(() => {
    const performAnalysis = async () => {
      if (!pdfDoc || !pdfFile || isLoadingPDF || pdfError) {
        return;
      }

      setIsAnalyzing(true);
      setError(null);
      setLoadingMessage("Analyzing pages for blank detection...");

      try {
        const pdfBytes = await pdfDoc.save();
        const pdfJsDoc = await loadPDFWithPDFJSFromBuffer(
          new Uint8Array(pdfBytes).buffer,
        );

        const analysisData = await analyzePagesForBlankDetection(
          pdfJsDoc,
          0,
          (current, total) => {
            setLoadingMessage(`Analyzing pages: ${current}/${total}`);
          },
        );

        setAnalysisCache(analysisData);
        setPdfJsDocCache(pdfJsDoc);

        const result = await updateAnalysisWithSensitivity(
          analysisData,
          sensitivity,
          pdfJsDoc,
        );
        setAnalysisResult(result);
      } catch (err) {
        console.error("Error analyzing pages:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to analyze PDF pages. Please try again.",
        );
      } finally {
        setIsAnalyzing(false);
        setLoadingMessage(null);
      }
    };

    performAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDoc, pdfFile, isLoadingPDF, pdfError]);

  useEffect(() => {
    const updateAnalysis = async () => {
      if (analysisCache.length === 0 || !pdfDoc || !pdfJsDocCache) {
        return;
      }

      setIsAnalyzing(true);
      setError(null);

      try {
        const result = await updateAnalysisWithSensitivity(
          analysisCache,
          sensitivity,
          pdfJsDocCache,
        );
        setAnalysisResult(result);
      } catch (err) {
        console.error("Error updating analysis:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to update analysis. Please try again.",
        );
      } finally {
        setIsAnalyzing(false);
      }
    };

    if (analysisCache.length > 0 && pdfJsDocCache) {
      updateAnalysis();
    }
  }, [sensitivity, analysisCache, pdfDoc, pdfJsDocCache]);

  const removeBlankPagesHandler = useCallback(async () => {
    if (!pdfFile) {
      setError("Please upload a PDF file first.");
      return;
    }

    if (!pdfDoc) {
      setError("PDF document is not loaded. Please try uploading again.");
      return;
    }

    if (!analysisResult || analysisResult.pagesToRemove.length === 0) {
      setError(
        "No blank pages found to remove at the current sensitivity level.",
      );
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage("Removing blank pages...");

    try {
      const pagesToKeep = Array.from(
        { length: totalPages },
        (_, i) => i,
      ).filter((index) => !analysisResult.pagesToRemove.includes(index + 1));

      if (pagesToKeep.length === 0) {
        setError(
          "All pages were identified as blank at the current sensitivity setting. No new file was created. Try lowering the sensitivity if you believe this is an error.",
        );
        setIsProcessing(false);
        setLoadingMessage(null);
        return;
      }

      if (pagesToKeep.length === totalPages) {
        setError(
          "No pages were identified as blank at the current sensitivity level.",
        );
        setIsProcessing(false);
        setLoadingMessage(null);
        return;
      }

      setLoadingMessage("Processing PDF...");
      const pdfBytes = await removeBlankPages(pdfDoc, pagesToKeep);
      saveAndDownloadPDF(pdfBytes, pdfFile.name);

      setSuccess(
        `Successfully removed ${analysisResult.pagesToRemove.length} blank page(s)! Your download has started.`,
      );
    } catch (err) {
      console.error("Error removing blank pages:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not remove blank pages. Please try again.",
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfFile,
    pdfDoc,
    analysisResult,
    totalPages,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
  ]);

  const reset = useCallback(() => {
    setSensitivity(99);
    setAnalysisResult(null);
    setAnalysisCache([]);
    resetProcessing();
    resetPDF();
  }, [resetProcessing, resetPDF]);

  return {
    sensitivity,
    analysisResult,
    isAnalyzing,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    setSensitivity,
    analyzePages: async () => {},
    removeBlankPages: removeBlankPagesHandler,
    loadPDF,
    reset,
  };
};
