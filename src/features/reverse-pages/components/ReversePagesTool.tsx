'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useReversePages } from '../hooks/useReversePages';
import { FileUploader } from '@/components/FileUploader';
import { FileListSection } from '@/components/common/FileListSection';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessMessages } from '@/components/common/ProcessMessages';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';

export const ReversePagesTool = () => {
  const {
    pdfFiles,
    isLoading,
    loadingMessage,
    error,
    isProcessing,
    processingSuccess,
    loadPDFs,
    removePDF,
    reversePages,
  } = useReversePages();

  const canProcess = pdfFiles.length > 0 && !isProcessing && !isLoading;

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
        Reverse PDF Pages
      </h2>
      <p className="mb-6 text-muted-foreground">
        Reverse the page order of one or more PDF files. All reversed PDFs will be downloaded as a ZIP file.
      </p>

      <div className="mb-4">
        <FileUploader
          accept="application/pdf"
          multiple={true}
          onFilesSelected={async (files) => {
            if (files.length > 0) {
              await loadPDFs(files);
            }
          }}
          disabled={isProcessing || isLoading}
        />
      </div>

      {pdfFiles.length > 0 && (
        <FileListSection
          title="PDF Files"
          files={pdfFiles.map((pdf) => ({
            id: pdf.id,
            fileName: pdf.fileName,
            fileSize: pdf.file.size,
          }))}
          onRemove={removePDF}
          disabled={isProcessing || isLoading}
          showIcon={false}
          className="mb-6"
        />
      )}

      {pdfFiles.length > 0 && (
        <div className="space-y-4">
          <ProcessButton
            onClick={reversePages}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
            disabled={!canProcess}
          >
            Reverse Pages{pdfFiles.length > 1 ? ' (All PDFs)' : ''}
          </ProcessButton>

          <ProcessMessages success={processingSuccess} error={error} />
        </div>
      )}

      <ProcessLoadingModal
        isProcessing={isProcessing || isLoading}
        loadingMessage={loadingMessage}
      />
    </div>
  );
};

