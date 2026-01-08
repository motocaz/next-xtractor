"use client";

import { useState, useCallback } from "react";
import { usePDFProcessor } from "@/hooks/usePDFProcessor";
import {
  splitByRange,
  splitByVisualSelection,
  splitEvenOdd,
  splitAllPages,
  splitByNPages,
} from "../lib/split-logic";
import { splitByBookmarks } from "../lib/bookmark-split";
import type { UseSplitPDFReturn, SplitMode, EvenOddChoice } from "../types";

const DEFAULT_SPLIT_MODE: SplitMode = "range";
const DEFAULT_EVEN_ODD_CHOICE: EvenOddChoice = "even";
const DEFAULT_BOOKMARK_LEVEL = "all";
const DEFAULT_N_VALUE = 5;

export const useSplitPDF = (): UseSplitPDFReturn => {
  const [splitMode, setSplitMode] = useState<SplitMode>(DEFAULT_SPLIT_MODE);
  const [pageRange, setPageRange] = useState<string>("");
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [evenOddChoice, setEvenOddChoice] = useState<EvenOddChoice>(
    DEFAULT_EVEN_ODD_CHOICE,
  );
  const [bookmarkLevel, setBookmarkLevel] = useState<string>(
    DEFAULT_BOOKMARK_LEVEL,
  );
  const [nValue, setNValue] = useState<number>(DEFAULT_N_VALUE);
  const [downloadAsZip, setDownloadAsZip] = useState<boolean>(false);

  const {
    pdfDoc,
    pdfFile,
    isProcessing,
    loadingMessage,
    error,
    success,
    isLoadingPDF,
    pdfError,
    totalPages,
    loadPDF: baseLoadPDF,
    resetPDF,
    setIsProcessing,
    setLoadingMessage,
    setError,
    setSuccess,
    resetProcessing,
  } = usePDFProcessor();

  const processSplit = useCallback(async () => {
    if (!pdfDoc) {
      setError("Please upload a PDF file first.");
      return;
    }

    if (!pdfFile) {
      setError("PDF file is not available. Please try uploading again.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage("Processing split...");

    try {
      const originalFileName = pdfFile.name;

      switch (splitMode) {
        case "range": {
          if (!pageRange || pageRange.trim() === "") {
            setError("Please enter a page range.");
            setIsProcessing(false);
            setLoadingMessage(null);
            return;
          }
          setLoadingMessage("Splitting PDF by range...");
          await splitByRange(pdfDoc, {
            pageRange,
            totalPages,
            downloadAsZip,
            originalFileName,
          });
          break;
        }

        case "visual": {
          if (selectedPages.size === 0) {
            setError("Please select at least one page.");
            setIsProcessing(false);
            setLoadingMessage(null);
            return;
          }
          setLoadingMessage("Splitting PDF by selection...");
          await splitByVisualSelection(pdfDoc, {
            selectedPages,
            downloadAsZip,
            originalFileName,
          });
          break;
        }

        case "even-odd": {
          setLoadingMessage("Splitting PDF into even/odd pages...");
          await splitEvenOdd(pdfDoc, {
            choice: evenOddChoice,
            totalPages,
            originalFileName,
          });
          break;
        }

        case "all": {
          setLoadingMessage("Splitting all pages...");
          await splitAllPages(pdfDoc, {
            totalPages,
            originalFileName,
          });
          break;
        }

        case "bookmarks": {
          setLoadingMessage("Splitting PDF by bookmarks...");
          await splitByBookmarks(pdfDoc, {
            bookmarkLevel,
            totalPages,
            originalFileName,
          });
          break;
        }

        case "n-times": {
          if (nValue < 1) {
            setError("N must be at least 1.");
            setIsProcessing(false);
            setLoadingMessage(null);
            return;
          }
          setLoadingMessage("Splitting PDF into chunks...");
          await splitByNPages(pdfDoc, {
            nValue,
            totalPages,
            originalFileName,
          });
          break;
        }

        default:
          setError("Invalid split mode.");
          setIsProcessing(false);
          setLoadingMessage(null);
          return;
      }

      setSuccess("PDF split successfully!");
    } catch (err) {
      console.error("Error splitting PDF:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while splitting the PDF. Please try again.",
      );
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfDoc,
    pdfFile,
    splitMode,
    pageRange,
    selectedPages,
    evenOddChoice,
    bookmarkLevel,
    nValue,
    downloadAsZip,
    totalPages,
    setIsProcessing,
    setError,
    setSuccess,
    setLoadingMessage,
  ]);

  const reset = useCallback(() => {
    setSplitMode(DEFAULT_SPLIT_MODE);
    setPageRange("");
    setSelectedPages(new Set());
    setEvenOddChoice(DEFAULT_EVEN_ODD_CHOICE);
    setBookmarkLevel(DEFAULT_BOOKMARK_LEVEL);
    setNValue(DEFAULT_N_VALUE);
    setDownloadAsZip(false);
    resetProcessing();
    resetPDF();
  }, [resetProcessing, resetPDF]);

  return {
    splitMode,
    pageRange,
    selectedPages,
    evenOddChoice,
    bookmarkLevel,
    nValue,
    downloadAsZip,
    pdfFile,
    pdfDoc,
    isProcessing,
    loadingMessage,
    error,
    success,
    isLoadingPDF,
    pdfError,
    totalPages,
    setSplitMode,
    setPageRange,
    setSelectedPages,
    setEvenOddChoice,
    setBookmarkLevel,
    setNValue,
    setDownloadAsZip,
    loadPDF: baseLoadPDF,
    processSplit,
    reset,
  };
};
