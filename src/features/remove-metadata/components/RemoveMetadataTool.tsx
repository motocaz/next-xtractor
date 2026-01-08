"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRemoveMetadata } from "../hooks/useRemoveMetadata";
import { PDFUploadSection } from "@/components/common/PDFUploadSection";
import { ProcessButton } from "@/components/common/ProcessButton";
import { ProcessMessages } from "@/components/common/ProcessMessages";
import { ProcessLoadingModal } from "@/components/common/ProcessLoadingModal";

export const RemoveMetadataTool = () => {
  const {
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    loadPDF,
    removeMetadata,
    reset,
  } = useRemoveMetadata();

  const showOptions = pdfDoc !== null && !isLoadingPDF && !pdfError;
  const canProcess = pdfDoc !== null && !isProcessing;

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
        Remove PDF Metadata
      </h2>
      <p className="mb-6 text-muted-foreground">
        Completely remove identifying metadata from your PDF.
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
        <div className="mt-6 space-y-4">
          <ProcessButton
            onClick={removeMetadata}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
            disabled={!canProcess}
          >
            Remove Metadata & Download
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
