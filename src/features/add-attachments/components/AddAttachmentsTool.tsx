"use client";

import Link from "next/link";
import { useAddAttachments } from "../hooks/useAddAttachments";
import { PDFUploadSection } from "@/components/common/PDFUploadSection";
import { FileUploader } from "@/components/FileUploader";
import { FileList } from "@/components/FileList";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

export const AddAttachmentsTool = () => {
  const {
    attachments,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    loadPDF,
    addAttachmentFiles,
    removeAttachment,
    processAttachments,
    reset,
  } = useAddAttachments();

  const showAttachmentOptions = pdfDoc !== null && !isLoadingPDF && !pdfError;

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
        Add Attachments to PDF
      </h2>
      <p className="mb-6 text-muted-foreground">
        First, upload the PDF document you want to add files to.
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

      {showAttachmentOptions && (
        <div id="attachment-options" className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Upload Files to Attach
          </h3>
          <p className="mb-4 text-muted-foreground">
            Select one or more files to embed within the PDF. You can attach any
            file type (images, documents, spreadsheets, etc.).
          </p>

          <FileUploader
            multiple={true}
            onFilesSelected={(files) => {
              addAttachmentFiles(files);
            }}
            disabled={isProcessing}
          />

          <FileList files={attachments} onRemove={removeAttachment} />

          {attachments.length > 0 && (
            <Button
              id="process-btn"
              variant="gradient"
              className="w-full mt-6"
              onClick={processAttachments}
              disabled={isProcessing || attachments.length === 0}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" />
                  {loadingMessage || "Processing..."}
                </span>
              ) : (
                "Embed Files & Download"
              )}
            </Button>
          )}

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
