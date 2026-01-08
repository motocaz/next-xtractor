"use client";

import Link from "next/link";
import { useDeletePages } from "../hooks/useDeletePages";
import { PDFUploadSection } from "@/components/common/PDFUploadSection";
import { ProcessButton } from "@/components/common/ProcessButton";
import { ProcessMessages } from "@/components/common/ProcessMessages";
import { ProcessLoadingModal } from "@/components/common/ProcessLoadingModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export const DeletePagesTool = () => {
  const {
    pagesToDelete,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    setPagesToDelete,
    loadPDF,
    deletePages,
    reset,
  } = useDeletePages();

  const showOptions = pdfDoc !== null && !isLoadingPDF && !pdfError;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <Link
        href="/#tools-header"
        className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 font-semibold transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Tools</span>
      </Link>

      <h2 className="text-2xl font-bold text-foreground mb-4">Delete Pages</h2>
      <p className="mb-6 text-muted-foreground">
        Remove specific pages from your PDF document.
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

      {showOptions && (
        <div id="delete-options" className="mt-6 space-y-4">
          <p className="mb-2 font-medium text-foreground">
            Total Pages: <span id="total-pages">{totalPages}</span>
          </p>

          <div>
            <Label htmlFor="pages-to-delete">
              Enter pages to delete (e.g., 2, 4-6, 9):
            </Label>
            <Input
              type="text"
              id="pages-to-delete"
              value={pagesToDelete}
              onChange={(e) => setPagesToDelete(e.target.value)}
              placeholder="e.g., 2, 4-6, 9"
              className="mt-2"
              disabled={isProcessing}
            />
          </div>

          <ProcessButton
            onClick={deletePages}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
          >
            Delete Pages & Download
          </ProcessButton>

          <ProcessMessages success={success} error={error} />
        </div>
      )}

      <ProcessLoadingModal
        isProcessing={isProcessing}
        loadingMessage={loadingMessage}
      />
    </div>
  );
};
