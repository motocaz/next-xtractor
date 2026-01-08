"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useSplitPDF } from "../hooks/useSplitPDF";
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
import {
  RangePanel,
  VisualPanel,
  EvenOddPanel,
  AllPanel,
  BookmarksPanel,
  NTimesPanel,
} from "./SplitModePanels";
import type { SplitMode } from "../types";

export const SplitPDFTool = () => {
  const {
    splitMode,
    pageRange,
    selectedPages,
    evenOddChoice,
    bookmarkLevel,
    nValue,
    downloadAsZip,
    pdfFile,
    pdfDoc,
    isProcessing,
    loadingMessage,
    error,
    success,
    isLoadingPDF,
    pdfError,
    totalPages,
    setSplitMode,
    setPageRange,
    setSelectedPages,
    setEvenOddChoice,
    setBookmarkLevel,
    setNValue,
    setDownloadAsZip,
    loadPDF,
    processSplit,
    reset,
  } = useSplitPDF();

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

      <h2 className="text-2xl font-bold text-foreground mb-4">Split PDF</h2>
      <p className="mb-6 text-muted-foreground">
        Extract pages from your PDF using various methods: page ranges, visual
        selection, bookmarks, or split into chunks.
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
        <div id="split-options" className="mt-6 space-y-6">
          <div>
            <Label htmlFor="split-mode" className="mb-2 block">
              Select Split Mode
            </Label>
            <Select
              value={splitMode}
              onValueChange={(value) => setSplitMode(value as SplitMode)}
              disabled={isProcessing}
            >
              <SelectTrigger id="split-mode" className="w-full">
                <SelectValue placeholder="Select split mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="range">Page Range</SelectItem>
                <SelectItem value="visual">Visual Selection</SelectItem>
                <SelectItem value="even-odd">Even/Odd Pages</SelectItem>
                <SelectItem value="all">All Pages</SelectItem>
                <SelectItem value="bookmarks">By Bookmarks</SelectItem>
                <SelectItem value="n-times">Split N Times</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 bg-input border border-border rounded-lg">
            {splitMode === "range" && (
              <RangePanel
                pageRange={pageRange}
                onPageRangeChange={setPageRange}
                downloadAsZip={downloadAsZip}
                onDownloadAsZipChange={setDownloadAsZip}
                totalPages={totalPages}
                disabled={isProcessing}
              />
            )}

            {splitMode === "visual" && pdfFile && (
              <VisualPanel
                pdfFile={pdfFile}
                selectedPages={selectedPages}
                onSelectionChange={setSelectedPages}
                downloadAsZip={downloadAsZip}
                onDownloadAsZipChange={setDownloadAsZip}
                disabled={isProcessing}
              />
            )}

            {splitMode === "even-odd" && (
              <EvenOddPanel
                choice={evenOddChoice}
                onChoiceChange={setEvenOddChoice}
                disabled={isProcessing}
              />
            )}

            {splitMode === "all" && <AllPanel totalPages={totalPages} />}

            {splitMode === "bookmarks" && (
              <BookmarksPanel
                bookmarkLevel={bookmarkLevel}
                onBookmarkLevelChange={setBookmarkLevel}
                disabled={isProcessing}
              />
            )}

            {splitMode === "n-times" && (
              <NTimesPanel
                nValue={nValue}
                onNValueChange={setNValue}
                totalPages={totalPages}
                disabled={isProcessing}
              />
            )}
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
