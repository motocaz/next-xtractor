"use client";

import Link from "next/link";
import { useAddPageNumbers } from "../hooks/useAddPageNumbers";
import { PDFUploadSection } from "@/components/common/PDFUploadSection";
import { ProcessButton } from "@/components/common/ProcessButton";
import { ProcessMessages } from "@/components/common/ProcessMessages";
import { ProcessLoadingModal } from "@/components/common/ProcessLoadingModal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";

export const AddPageNumbersTool = () => {
  const {
    position,
    fontSize,
    format,
    textColor,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    setPosition,
    setFontSize,
    setFormat,
    setTextColor,
    loadPDF,
    processPageNumbers,
    reset,
  } = useAddPageNumbers();

  const showPageNumberOptions = pdfDoc !== null && !isLoadingPDF && !pdfError;

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
        Add Page Numbers
      </h2>
      <p className="mb-6 text-muted-foreground">
        Add customizable page numbers to your PDF file.
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

      {showPageNumberOptions && (
        <div id="pagenum-options" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="position"
                className="block mb-2 text-sm font-medium text-foreground"
              >
                Position
              </label>
              <Select
                value={position}
                onValueChange={setPosition}
                disabled={isProcessing}
              >
                <SelectTrigger
                  id="position"
                  className="w-full bg-background dark:bg-card"
                >
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-center">Bottom Center</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="top-center">Top Center</SelectItem>
                  <SelectItem value="top-left">Top Left</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label
                htmlFor="font-size"
                className="block mb-2 text-sm font-medium text-foreground"
              >
                Font Size
              </label>
              <Input
                type="number"
                id="font-size"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                min="1"
                className="bg-background! dark:bg-card!"
                disabled={isProcessing}
              />
            </div>

            <div>
              <label
                htmlFor="number-format"
                className="block mb-2 text-sm font-medium text-foreground"
              >
                Format
              </label>
              <Select
                value={format}
                onValueChange={setFormat}
                disabled={isProcessing}
              >
                <SelectTrigger
                  id="number-format"
                  className="w-full bg-background dark:bg-card"
                >
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">1, 2, 3...</SelectItem>
                  <SelectItem value="page_x_of_y">Page 1/N, 2/N...</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label
                htmlFor="text-color"
                className="block mb-2 text-sm font-medium text-foreground"
              >
                Text Color
              </label>
              <Input
                type="color"
                id="text-color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="h-[42px] p-1 cursor-pointer bg-background! dark:bg-card!"
                disabled={isProcessing}
              />
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Total pages: <span id="total-pages">{totalPages}</span>
          </div>

          <ProcessButton
            onClick={processPageNumbers}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
          >
            Add Page Numbers
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
