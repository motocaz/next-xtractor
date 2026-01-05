'use client';

import Link from 'next/link';
import { usePdfToBmp } from '../hooks/usePdfToBmp';
import { FileUploader } from '@/components/FileUploader';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, ArrowLeft, X } from 'lucide-react';
import { formatBytes } from '@/lib/pdf/file-utils';
import { FileUploadStatusMessages } from '@/components/common/FileUploadStatusMessages';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';

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
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            PDF File
          </h3>
          <Card className="bg-input border-border">
            <CardContent className="p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium text-foreground text-sm">
                    {pdfFile.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatBytes(pdfFile.size)}</span>
                    {totalPages > 0 && (
                      <>
                        <span>•</span>
                        <span>{totalPages} page{totalPages !== 1 ? 's' : ''}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={reset}
                className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                aria-label={`Remove ${pdfFile.name}`}
                title="Remove PDF file"
                disabled={isProcessing}
              >
                <X className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        </div>
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

