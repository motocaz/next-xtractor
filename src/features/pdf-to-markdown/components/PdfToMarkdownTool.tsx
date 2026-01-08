"use client";

import Link from "next/link";
import { usePdfToMarkdown } from "../hooks/usePdfToMarkdown";
import { FileUploader } from "@/components/FileUploader";
import { ArrowLeft } from "lucide-react";
import { FileUploadStatusMessages } from "@/components/common/FileUploadStatusMessages";
import { ProcessButton } from "@/components/common/ProcessButton";
import { ProcessLoadingModal } from "@/components/common/ProcessLoadingModal";
import { PdfFileCard } from "@/components/common/PdfFileCard";
import { AlertTriangle } from "lucide-react";

export const PdfToMarkdownTool = () => {
  const {
    pdfFile,
    isLoadingPDF,
    pdfError,
    isProcessing,
    loadingMessage,
    error,
    success,
    totalPages,
    loadPDF,
    processPdfToMarkdown,
    reset,
  } = usePdfToMarkdown();

  const canProcess = pdfFile !== null && !isProcessing && !isLoadingPDF;

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
        PDF to Markdown
      </h2>
      <p className="mb-6 text-muted-foreground">
        Convert a PDF&apos;s text content into a structured Markdown file.
      </p>

      <div className="mb-4">
        <FileUploader
          accept="application/pdf"
          multiple={false}
          onFilesSelected={async (files) => {
            if (files.length > 0) {
              await loadPDF(files[0]);
            }
          }}
          disabled={isLoadingPDF || isProcessing}
        />
      </div>

      <FileUploadStatusMessages
        isLoading={isLoadingPDF}
        loadingMessage={loadingMessage}
        defaultLoadingText="Loading PDF file..."
        error={pdfError || error}
        success={success}
      />

      {pdfFile && (
        <PdfFileCard
          pdfFile={pdfFile}
          totalPages={totalPages}
          onRemove={reset}
          disabled={isProcessing}
          className="mb-4"
        />
      )}

      {pdfFile && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-yellow-600 dark:text-yellow-400 text-sm">
              <strong>Note:</strong> This is a text-focused conversion. Tables
              and images will not be included.
            </p>
          </div>
        </div>
      )}

      {pdfFile && (
        <ProcessButton
          onClick={processPdfToMarkdown}
          disabled={!canProcess}
          isProcessing={isProcessing}
          loadingMessage={loadingMessage}
        >
          Convert to Markdown
        </ProcessButton>
      )}

      <ProcessLoadingModal
        isProcessing={isProcessing}
        loadingMessage={loadingMessage}
      />
    </div>
  );
};
