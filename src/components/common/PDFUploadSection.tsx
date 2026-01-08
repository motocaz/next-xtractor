"use client";

import { FileUploader } from "@/components/FileUploader";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import type { PDFDocument } from "pdf-lib";

export interface PDFUploadSectionProps {
  pdfFile: File | null;
  pdfDoc?: PDFDocument | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  loadPDF: (file: File) => Promise<void>;
  reset: () => void;
  disabled?: boolean;
}

export const PDFUploadSection = ({
  pdfFile,
  pdfDoc,
  isLoadingPDF,
  pdfError,
  loadPDF,
  reset,
  disabled = false,
}: PDFUploadSectionProps) => {
  return (
    <>
      <div className="mb-4">
        <FileUploader
          accept="application/pdf"
          multiple={false}
          onFilesSelected={async (files) => {
            if (files[0]) {
              await loadPDF(files[0]);
            }
          }}
          disabled={isLoadingPDF || disabled}
        />
      </div>

      <div id="file-display-area" className="mt-4 space-y-2">
        {isLoadingPDF && (
          <div className="flex items-center gap-2 p-2 bg-input rounded-md">
            <Spinner size="sm" />
            <span className="text-sm text-muted-foreground">
              Loading PDF...
            </span>
          </div>
        )}

        {pdfError && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span className="text-sm text-destructive">{pdfError}</span>
          </div>
        )}

        {pdfFile && !pdfError && (
          <div className="flex items-center justify-between gap-2 p-2 bg-input rounded-md">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm text-foreground truncate">
                {pdfFile.name}
              </span>
            </div>
            <button
              onClick={reset}
              className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
              aria-label="Remove PDF"
              title="Remove PDF"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};
