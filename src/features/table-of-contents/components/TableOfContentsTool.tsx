"use client";

import Link from "next/link";
import { useTableOfContents } from "../hooks/useTableOfContents";
import { PDFUploadSection } from "@/components/common/PDFUploadSection";
import { ProcessButton } from "@/components/common/ProcessButton";
import { ProcessMessages } from "@/components/common/ProcessMessages";
import { ProcessLoadingModal } from "@/components/common/ProcessLoadingModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";

const fontSizes = [
  10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 30, 36, 42, 48, 60, 72,
];

const fontFamilies = [
  { value: 0, label: "Times Roman" },
  { value: 1, label: "Times Bold" },
  { value: 2, label: "Times Italic" },
  { value: 3, label: "Times Bold Italic" },
  { value: 4, label: "Helvetica" },
  { value: 5, label: "Helvetica Bold" },
  { value: 6, label: "Helvetica Oblique" },
  { value: 7, label: "Helvetica Bold Oblique" },
  { value: 8, label: "Courier" },
  { value: 9, label: "Courier Bold" },
  { value: 10, label: "Courier Oblique" },
  { value: 11, label: "Courier Bold Oblique" },
];

export const TableOfContentsTool = () => {
  const {
    title,
    fontSize,
    fontFamily,
    addBookmark,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    setTitle,
    setFontSize,
    setFontFamily,
    setAddBookmark,
    loadPDF,
    generateTOC,
    reset,
  } = useTableOfContents();

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
        Generate Table of Contents
      </h2>
      <p className="mb-6 text-muted-foreground">
        Upload a PDF with bookmarks to generate a table of contents page.
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
          <div>
            <Label htmlFor="toc-title">TOC Title</Label>
            <Input
              type="text"
              id="toc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2"
              placeholder="Table of Contents"
              disabled={isProcessing}
            />
          </div>

          <div>
            <Label htmlFor="font-size">Font Size</Label>
            <Select
              value={fontSize.toString()}
              onValueChange={(value) => setFontSize(Number.parseInt(value, 10))}
              disabled={isProcessing}
            >
              <SelectTrigger id="font-size" className="mt-2 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontSizes.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}pt
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="font-family">Font Family</Label>
            <Select
              value={fontFamily.toString()}
              onValueChange={(value) =>
                setFontFamily(Number.parseInt(value, 10))
              }
              disabled={isProcessing}
            >
              <SelectTrigger id="font-family" className="mt-2 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map((family) => (
                  <SelectItem
                    key={family.value}
                    value={family.value.toString()}
                  >
                    {family.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="add-bookmark"
              checked={addBookmark}
              onCheckedChange={(checked) => setAddBookmark(checked === true)}
              disabled={isProcessing}
            />
            <Label
              htmlFor="add-bookmark"
              className="text-sm font-normal cursor-pointer"
            >
              Add bookmark for TOC page
            </Label>
          </div>

          <ProcessButton
            onClick={generateTOC}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
          >
            Generate Table of Contents
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
