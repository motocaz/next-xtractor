'use client';

import Link from 'next/link';
import { useAddHeaderFooter } from '../hooks/useAddHeaderFooter';
import { PDFUploadSection } from '@/components/common/PDFUploadSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export const AddHeaderFooterTool = () => {
  const {
    pageRange,
    fontSize,
    fontColor,
    headerLeft,
    headerCenter,
    headerRight,
    footerLeft,
    footerCenter,
    footerRight,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    setPageRange,
    setFontSize,
    setFontColor,
    setHeaderLeft,
    setHeaderCenter,
    setHeaderRight,
    setFooterLeft,
    setFooterCenter,
    setFooterRight,
    loadPDF,
    processHeaderFooter,
    reset,
  } = useAddHeaderFooter();

  const showHeaderFooterOptions = pdfDoc !== null && !isLoadingPDF && !pdfError;

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
        Add Header & Footer
      </h2>
      <p className="mb-6 text-muted-foreground">
        Add custom text to the top and bottom margins of every page.
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

      {showHeaderFooterOptions && (
        <div id="header-footer-options" className="mt-6 space-y-4">
          <div className="p-4 bg-input border border-border rounded-lg">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Formatting Options
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="page-range"
                  className="block mb-2 text-sm font-medium text-foreground"
                >
                  Page Range (optional)
                </label>
                <Input
                  type="text"
                  id="page-range"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder="e.g., 1-3, 5"
                  className="bg-background! dark:bg-card!"
                  disabled={isProcessing}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Total pages: <span id="total-pages">{totalPages}</span>
                </p>
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
                  htmlFor="font-color"
                  className="block mb-2 text-sm font-medium text-foreground"
                >
                  Font Color
                </label>
                <Input
                  type="color"
                  id="font-color"
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                  className="h-[42px] p-1 cursor-pointer bg-background! dark:bg-card!"
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="header-left"
                className="block mb-2 text-sm font-medium text-foreground"
              >
                Header Left
              </label>
              <Input
                type="text"
                id="header-left"
                value={headerLeft}
                onChange={(e) => setHeaderLeft(e.target.value)}
                placeholder="Use {page} or {total}"
                disabled={isProcessing}
              />
            </div>
            <div>
              <label
                htmlFor="header-center"
                className="block mb-2 text-sm font-medium text-foreground"
              >
                Header Center
              </label>
              <Input
                type="text"
                id="header-center"
                value={headerCenter}
                onChange={(e) => setHeaderCenter(e.target.value)}
                placeholder="Use {page} or {total}"
                disabled={isProcessing}
              />
            </div>
            <div>
              <label
                htmlFor="header-right"
                className="block mb-2 text-sm font-medium text-foreground"
              >
                Header Right
              </label>
              <Input
                type="text"
                id="header-right"
                value={headerRight}
                onChange={(e) => setHeaderRight(e.target.value)}
                placeholder="Use {page} or {total}"
                disabled={isProcessing}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="footer-left"
                className="block mb-2 text-sm font-medium text-foreground"
              >
                Footer Left
              </label>
              <Input
                type="text"
                id="footer-left"
                value={footerLeft}
                onChange={(e) => setFooterLeft(e.target.value)}
                placeholder="Use {page} or {total}"
                disabled={isProcessing}
              />
            </div>
            <div>
              <label
                htmlFor="footer-center"
                className="block mb-2 text-sm font-medium text-foreground"
              >
                Footer Center
              </label>
              <Input
                type="text"
                id="footer-center"
                value={footerCenter}
                onChange={(e) => setFooterCenter(e.target.value)}
                placeholder="Use {page} or {total}"
                disabled={isProcessing}
              />
            </div>
            <div>
              <label
                htmlFor="footer-right"
                className="block mb-2 text-sm font-medium text-foreground"
              >
                Footer Right
              </label>
              <Input
                type="text"
                id="footer-right"
                value={footerRight}
                onChange={(e) => setFooterRight(e.target.value)}
                placeholder="Use {page} or {total}"
                disabled={isProcessing}
              />
            </div>
          </div>

          <Button
            id="process-btn"
            variant="gradient"
            className="w-full"
            onClick={processHeaderFooter}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                {loadingMessage || 'Processing...'}
              </span>
            ) : (
              'Apply Header & Footer'
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

