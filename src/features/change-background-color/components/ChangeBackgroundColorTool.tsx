'use client';

import Link from 'next/link';
import { useChangeBackgroundColor } from '../hooks/useChangeBackgroundColor';
import { PDFUploadSection } from '@/components/common/PDFUploadSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

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

          <Button
            id="process-btn"
            variant="gradient"
            className="w-full"
            onClick={processBackgroundColor}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                {loadingMessage || 'Processing...'}
              </span>
            ) : (
              'Apply Color & Download'
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

