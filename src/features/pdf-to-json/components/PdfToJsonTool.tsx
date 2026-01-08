"use client";

import Link from "next/link";
import { usePdfToJson } from "../hooks/usePdfToJson";
import { FileUploader } from "@/components/FileUploader";
import { ArrowLeft } from "lucide-react";
import { FileUploadStatusMessages } from "@/components/common/FileUploadStatusMessages";
import { ProcessButton } from "@/components/common/ProcessButton";
import { ProcessLoadingModal } from "@/components/common/ProcessLoadingModal";
import { FileListSection } from "@/components/common/FileListSection";

export const PdfToJsonTool = () => {
  const {
    pdfFiles,
    isLoading,
    isProcessing,
    loadingMessage,
    error,
    success,
    loadPdfFiles,
    removePdfFile,
    processPdfToJson,
  } = usePdfToJson();

  const canProcess = pdfFiles.length > 0 && !isProcessing && !isLoading;

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
        PDF to JSON Converter
      </h2>
      <p className="mb-6 text-muted-foreground">
        Convert PDF files to JSON format. Files will be downloaded as a ZIP
        archive.
      </p>

      <div className="mb-4">
        <FileUploader
          accept="application/pdf"
          multiple={true}
          onFilesSelected={async (files) => {
            if (files.length > 0) {
              await loadPdfFiles(files);
            }
          }}
          disabled={isLoading || isProcessing}
        />
      </div>

      <FileUploadStatusMessages
        isLoading={isLoading}
        loadingMessage={loadingMessage}
        defaultLoadingText="Loading PDF files..."
        error={error}
        success={success}
      />

      {pdfFiles.length > 0 && (
        <FileListSection
          title="PDF Files"
          files={pdfFiles}
          onRemove={removePdfFile}
          disabled={isProcessing}
          showIcon={true}
          className="mb-4"
        />
      )}

      {pdfFiles.length > 0 && (
        <ProcessButton
          onClick={processPdfToJson}
          disabled={!canProcess}
          isProcessing={isProcessing}
          loadingMessage={loadingMessage}
        >
          Convert to JSON
        </ProcessButton>
      )}

      <ProcessLoadingModal
        isProcessing={isProcessing}
        loadingMessage={loadingMessage}
      />
    </div>
  );
};
