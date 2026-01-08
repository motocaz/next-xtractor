"use client";

import Link from "next/link";
import { useChangeBackgroundColor } from "../hooks/useChangeBackgroundColor";
import { PDFUploadSection } from "@/components/common/PDFUploadSection";
import { ProcessButton } from "@/components/common/ProcessButton";
import { ProcessMessages } from "@/components/common/ProcessMessages";
import { ProcessLoadingModal } from "@/components/common/ProcessLoadingModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export const ChangeBackgroundColorTool = () => {
  const {
    backgroundColor,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    setBackgroundColor,
    loadPDF,
    processBackgroundColor,
    reset,
  } = useChangeBackgroundColor();

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

      <h2 className="text-2xl font-bold text-foreground mb-4">
        Change Background Color
      </h2>
      <p className="mb-6 text-muted-foreground">
        Select a new background color for every page of your PDF.
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
        <div id="change-background-color-options" className="mt-6 space-y-4">
          <Card>
            <CardContent className="pt-6 pb-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="background-color">
                  Choose Background Color
                </Label>
                <Input
                  type="color"
                  id="background-color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="h-[42px] p-1 cursor-pointer"
                  disabled={isProcessing}
                />
              </div>
            </CardContent>
          </Card>

          <div className="text-xs text-muted-foreground">
            Total pages: <span id="total-pages">{totalPages}</span>
          </div>

          <ProcessButton
            onClick={processBackgroundColor}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
          >
            Apply Color & Download
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
