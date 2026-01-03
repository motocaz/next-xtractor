'use client';

import Link from 'next/link';
import { useInvertColors } from '../hooks/useInvertColors';
import { PDFUploadSection } from '@/components/common/PDFUploadSection';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessMessages } from '@/components/common/ProcessMessages';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';
import { ArrowLeft } from 'lucide-react';

export const InvertColorsTool = () => {
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
    processInvertColors,
    reset,
  } = useInvertColors();

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
        Invert PDF Colors
      </h2>
      <p className="mb-6 text-muted-foreground">
        Convert your PDF to a &quot;dark mode&quot; by inverting its colors.
        This works best on simple text and image documents.
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
        <div id="invert-colors-options" className="mt-6 space-y-4">
          <div className="text-xs text-muted-foreground">
            Total pages: <span id="total-pages">{totalPages}</span>
          </div>

          <ProcessButton
            onClick={processInvertColors}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
          >
            Invert Colors & Download
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

