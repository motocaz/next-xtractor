"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useSplitInHalf } from "../hooks/useSplitInHalf";
import { PDFUploadSection } from "@/components/common/PDFUploadSection";
import { ProcessButton } from "@/components/common/ProcessButton";
import { ProcessMessages } from "@/components/common/ProcessMessages";
import { ProcessLoadingModal } from "@/components/common/ProcessLoadingModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const SplitInHalfTool = () => {
  const {
    splitType,
    pdfFile,
    isProcessing,
    loadingMessage,
    error,
    success,
    isLoadingPDF,
    pdfError,
    setSplitType,
    loadPDF,
    processSplit,
    reset,
  } = useSplitInHalf();

  const showOptions = pdfFile !== null && !isLoadingPDF && !pdfError;

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
        Split Pages in Half
      </h2>
      <p className="mb-6 text-muted-foreground">
        Choose a method to divide every page of your document into two separate
        pages.
      </p>

      <PDFUploadSection
        pdfFile={pdfFile}
        isLoadingPDF={isLoadingPDF}
        pdfError={pdfError}
        loadPDF={loadPDF}
        reset={reset}
        disabled={isProcessing}
      />

      {showOptions && (
        <div id="split-half-options" className="mt-6 space-y-4">
          <div>
            <Label htmlFor="split-type" className="mb-2 block">
              Select Split Type
            </Label>
            <Select
              value={splitType}
              onValueChange={(value) =>
                setSplitType(value as "vertical" | "horizontal")
              }
              disabled={isProcessing}
            >
              <SelectTrigger id="split-type" className="w-full">
                <SelectValue placeholder="Select split type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vertical">
                  Split Vertically (Left &amp; Right halves)
                </SelectItem>
                <SelectItem value="horizontal">
                  Split Horizontally (Top &amp; Bottom halves)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ProcessButton
            onClick={processSplit}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
            disabled={isProcessing || !pdfFile}
          >
            Split PDF
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
