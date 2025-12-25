'use client';

import Link from 'next/link';
import { useAddPageNumbers } from '../hooks/useAddPageNumbers';
import { FileUploader } from '@/components/FileUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, AlertCircle, ArrowLeft, X } from 'lucide-react';

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

      <div className="mb-4">
        <FileUploader
          accept="application/pdf"
          multiple={false}
          onFilesSelected={async (files) => {
            if (files[0]) {
              await loadPDF(files[0]);
            }
          }}
          disabled={isLoadingPDF || isProcessing}
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

        {pdfFile && pdfDoc && !pdfError && (
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
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

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

          <Button
            id="process-btn"
            variant="gradient"
            className="w-full"
            onClick={processPageNumbers}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                {loadingMessage || 'Processing...'}
              </span>
            ) : (
              'Add Page Numbers'
            )}
          </Button>

          {success && (
            <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-md">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-sm text-foreground">{success}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
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

