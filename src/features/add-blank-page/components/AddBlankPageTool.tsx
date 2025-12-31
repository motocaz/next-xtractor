"use client";

import Link from "next/link";
import { useAddBlankPage } from "../hooks/useAddBlankPage";
import { PDFUploadSection } from "@/components/common/PDFUploadSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

export const AddBlankPageTool = () => {
  const {
    pageNumber,
    pageCount,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    setPageNumber,
    setPageCount,
    loadPDF,
    processBlankPages,
    reset,
  } = useAddBlankPage();

  const showBlankPageOptions = pdfDoc !== null && !isLoadingPDF && !pdfError;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <Link
        href="/#tools-header"
        className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 font-semibold transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Tools</span>
      </Link>

      <h2 className="text-2xl font-bold text-foreground mb-4">
        Add Blank Pages
      </h2>
      <p className="mb-6 text-muted-foreground">
        Insert one or more blank pages at a specific position in your document.
      </p>

      <PDFUploadSection
        pdfFile={pdfFile}
        pdfDoc={pdfDoc}
        isLoadingPDF={isLoadingPDF}
        pdfError={pdfError}
        loadPDF={loadPDF}
        reset={reset}
        disabled={isProcessing}
      />

      {showBlankPageOptions && (
        <div id="blank-page-options" className="mt-6">
          <p className="mb-2 font-medium text-foreground">
            Total Pages: <span id="total-pages">{totalPages}</span>
          </p>

          <label
            htmlFor="page-number"
            className="block mb-2 text-sm font-medium text-foreground"
          >
            Insert blank pages after page number:
          </label>
          <Input
            type="number"
            id="page-number"
            min="0"
            max={totalPages}
            value={pageNumber}
            onChange={(e) => setPageNumber(e.target.value)}
            placeholder="Enter 0 to add to the beginning"
            disabled={isProcessing}
            className="mb-4"
          />

          <label
            htmlFor="page-count"
            className="block mb-2 text-sm font-medium text-foreground"
          >
            Number of blank pages to insert:
          </label>
          <Input
            type="number"
            inputMode="numeric"
            id="page-count"
            min="1"
            value={pageCount}
            onChange={(e) => setPageCount(e.target.value)}
            placeholder="Enter number of pages"
            disabled={isProcessing}
            className="mb-6"
          />

          <Button
            id="process-btn"
            variant="gradient"
            className="w-full"
            onClick={processBlankPages}
            disabled={isProcessing || !pageCount}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                {loadingMessage || "Processing..."}
              </span>
            ) : (
              "Add Pages & Download"
            )}
          </Button>

          {success && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-md">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-sm text-foreground">{success}</span>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}
        </div>
      )}

      {isProcessing && loadingMessage && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-foreground">{loadingMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};
