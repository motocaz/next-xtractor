'use client';

import Link from 'next/link';
import { usePdfToBmp } from '../hooks/usePdfToBmp';
import { FileUploader } from '@/components/FileUploader';
import { ArrowLeft } from 'lucide-react';
import { FileUploadStatusMessages } from '@/components/common/FileUploadStatusMessages';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';
import { PdfFileCard } from '@/components/common/PdfFileCard';

export const PdfToBmpTool = () => {
  const {
    pdfFile,
    isLoadingPDF,
    pdfError,
    isProcessing,
    loadingMessage,
    error,
    success,
    totalPages,
    loadPDF,
    processPdfToBmp,
    reset,
  } = usePdfToBmp();

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
        PDF to BMP
      </h2>
      <p className="mb-6 text-muted-foreground">
        Convert each page of a PDF file into a BMP image. Your files will be downloaded in a ZIP archive.
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
        <ProcessButton
          onClick={processPdfToBmp}
          disabled={!canProcess}
          isProcessing={isProcessing}
          loadingMessage={loadingMessage}
        >
          Convert to BMP & Download ZIP
        </ProcessButton>
      )}

      <ProcessLoadingModal
        isProcessing={isProcessing}
        loadingMessage={loadingMessage}
      />
    </div>
  );
};

