'use client';

import Link from 'next/link';
import { usePdfToGreyscale } from '../hooks/usePdfToGreyscale';
import { PDFUploadSection } from '@/components/common/PDFUploadSection';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessMessages } from '@/components/common/ProcessMessages';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';
import { ArrowLeft } from 'lucide-react';

export const PdfToGreyscaleTool = () => {
  const {
    pdfFile,
    pdfDoc,
    isProcessing,
    loadingMessage,
    error,
    success,
    isLoadingPDF,
    pdfError,
    totalPages,
    loadPDF,
    processPdfToGreyscale,
    reset,
  } = usePdfToGreyscale();

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
        PDF to Greyscale
      </h2>
      <p className="mb-6 text-muted-foreground">
        Convert a color PDF into a black-and-white version. This is done by
        rendering each page, applying a greyscale filter, and rebuilding the
        PDF.
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
        <div id="pdf-to-greyscale-options" className="mt-6 space-y-4">
          <div className="text-xs text-muted-foreground">
            Total pages: <span id="total-pages">{totalPages}</span>
          </div>

          <ProcessButton
            onClick={processPdfToGreyscale}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
          >
            Convert to Greyscale & Download
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

