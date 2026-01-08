"use client";

import Link from "next/link";
import { useCombineSinglePage } from "../hooks/useCombineSinglePage";
import { PDFUploadSection } from "@/components/common/PDFUploadSection";
import { ProcessButton } from "@/components/common/ProcessButton";
import { ProcessMessages } from "@/components/common/ProcessMessages";
import { ProcessLoadingModal } from "@/components/common/ProcessLoadingModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";

export const CombineSinglePageTool = () => {
  const {
    pdfFile,
    spacing,
    backgroundColorHex,
    addSeparator,
    isProcessing,
    loadingMessage,
    error,
    success,
    isLoadingPDF,
    pdfError,
    setSpacing,
    setBackgroundColorHex,
    setAddSeparator,
    loadPDF,
    processCombine,
    reset,
  } = useCombineSinglePage();

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
        Combine to a Single Page
      </h2>
      <p className="mb-6 text-muted-foreground">
        Stitch all pages of your PDF together vertically to create one
        continuous, scrollable page.
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
        <div id="combine-options" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="page-spacing">
                Spacing Between Pages (in points)
              </Label>
              <Input
                type="number"
                id="page-spacing"
                value={spacing}
                onChange={(e) => {
                  const value = Number.parseInt(e.target.value, 10);
                  if (!Number.isNaN(value) && value >= 0) {
                    setSpacing(value);
                  }
                }}
                className="mt-2"
                disabled={isProcessing}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="background-color">Background Color</Label>
              <Input
                type="color"
                id="background-color"
                value={backgroundColorHex}
                onChange={(e) => setBackgroundColorHex(e.target.value)}
                className="w-full h-[42px] mt-2 cursor-pointer"
                disabled={isProcessing}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="add-separator"
                checked={addSeparator}
                onCheckedChange={(checked) => setAddSeparator(checked === true)}
                disabled={isProcessing}
              />
              <Label
                htmlFor="add-separator"
                className="text-sm font-medium cursor-pointer"
              >
                Draw a separator line between pages
              </Label>
            </div>
          </div>

          <ProcessButton
            onClick={processCombine}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
          >
            Combine Pages
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
