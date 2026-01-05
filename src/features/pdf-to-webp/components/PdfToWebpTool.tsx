'use client';

import Link from 'next/link';
import { usePdfToWebp } from '../hooks/usePdfToWebp';
import { FileUploader } from '@/components/FileUploader';
import { ArrowLeft } from 'lucide-react';
import { FileUploadStatusMessages } from '@/components/common/FileUploadStatusMessages';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';
import { Slider } from '@/components/ui/slider';
import { PdfFileCard } from '@/components/common/PdfFileCard';

export const PdfToWebpTool = () => {
  const {
    pdfFile,
    isLoadingPDF,
    pdfError,
    isProcessing,
    loadingMessage,
    error,
    success,
    totalPages,
    quality,
    setQuality,
    loadPDF,
    processPdfToWebp,
    reset,
  } = usePdfToWebp();

  const canProcess = pdfFile !== null && !isProcessing && !isLoadingPDF;

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
        PDF to WebP
      </h2>
      <p className="mb-6 text-muted-foreground">
        Convert each page of a PDF file into a WebP image. Your files will be downloaded in a ZIP archive.
      </p>

      <div className="mb-4">
        <FileUploader
          accept="application/pdf"
          multiple={false}
          onFilesSelected={async (files) => {
            if (files.length > 0) {
              await loadPDF(files[0]);
            }
          }}
          disabled={isLoadingPDF || isProcessing}
        />
      </div>

      <FileUploadStatusMessages
        isLoading={isLoadingPDF}
        loadingMessage={loadingMessage}
        defaultLoadingText="Loading PDF file..."
        error={pdfError || error}
        success={success}
      />

      {pdfFile && (
        <PdfFileCard
          pdfFile={pdfFile}
          totalPages={totalPages}
          onRemove={reset}
          disabled={isProcessing}
          className="mb-4"
        />
      )}

      {pdfFile && (
        <div className="mb-4 p-4 bg-input rounded-md border border-border">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="webp-quality-slider"
              className="text-sm font-medium text-foreground"
            >
              Image Quality
            </label>
            <span className="text-sm text-muted-foreground">
              {Math.round(quality * 100)}%
            </span>
          </div>
          <Slider
            id="webp-quality-slider"
            value={[quality]}
            onValueChange={(values) => setQuality(values[0])}
            min={0.1}
            max={1.0}
            step={0.1}
            className="w-full"
            disabled={isProcessing}
            aria-label="WebP Quality"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Higher quality = larger file size
          </p>
        </div>
      )}

      {pdfFile && (
        <ProcessButton
          onClick={processPdfToWebp}
          disabled={!canProcess}
          isProcessing={isProcessing}
          loadingMessage={loadingMessage}
        >
          Convert to WebP & Download ZIP
        </ProcessButton>
      )}

      <ProcessLoadingModal
        isProcessing={isProcessing}
        loadingMessage={loadingMessage}
      />
    </div>
  );
};

