'use client';

import Link from 'next/link';
import { useExtractAttachments } from '../hooks/useExtractAttachments';
import { FileUploader } from '@/components/FileUploader';
import { FileList } from '@/components/FileList';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessMessages } from '@/components/common/ProcessMessages';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';
import { ArrowLeft } from 'lucide-react';

export const ExtractAttachmentsTool = () => {
  const {
    pdfFiles,
    isProcessing,
    loadingMessage,
    error,
    success,
    loadPDFs,
    removePDF,
    extractAttachments,
  } = useExtractAttachments();

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
        Extract Attachments from PDF
      </h2>
      <p className="mb-6 text-muted-foreground">
        Upload one or more PDF files to extract all embedded attachments. All
        attachments will be packaged into a ZIP file for download.
      </p>

      <div className="mb-4">
        <FileUploader
          accept="application/pdf"
          multiple={true}
          onFilesSelected={(files) => {
            loadPDFs(files);
          }}
          disabled={isProcessing}
        />
      </div>

      <FileList files={pdfFiles} onRemove={removePDF} />

      {pdfFiles.length > 0 && (
        <div className="mt-6 space-y-4">
          <ProcessButton
            onClick={extractAttachments}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
            disabled={pdfFiles.length === 0}
          >
            Extract Attachments & Download ZIP
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

