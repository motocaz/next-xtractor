'use client';

import Link from 'next/link';
import { useWordToPdf } from '../hooks/useWordToPdf';
import { FileUploader } from '@/components/FileUploader';
import { ArrowLeft } from 'lucide-react';
import { FileUploadStatusMessages } from '@/components/common/FileUploadStatusMessages';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';
import { ProcessMessages } from '@/components/common/ProcessMessages';
import { FileCard } from '@/components/common/FileCard';
import { Button } from '@/components/ui/button';

export const WordToPdfTool = () => {
  const {
    wordFile,
    isLoading,
    loadingMessage,
    isProcessing,
    processingMessage,
    error,
    loadWordFile,
    convertAndDownloadPdf,
    reset,
  } = useWordToPdf();

  const canConvert = wordFile && !isLoading && !isProcessing;

  const handleFileSelected = async (files: File[]) => {
    if (files.length > 0) {
      await loadWordFile(files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <Link
        href="/#tools-header"
        className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 font-semibold transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Tools</span>
      </Link>

      <h2 className="text-2xl font-bold text-foreground mb-4">Word to PDF</h2>
      <p className="mb-6 text-muted-foreground">
        Upload a Word document (.docx) to convert it to PDF format.
      </p>

      <div className="mb-6">
        <FileUploader
          accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
          multiple={false}
          onFilesSelected={handleFileSelected}
          disabled={isLoading || isProcessing}
        />

        <FileUploadStatusMessages
          isLoading={isLoading}
          loadingMessage={loadingMessage}
          defaultLoadingText="Loading Word document..."
          error={error}
          success={null}
        />

        {wordFile && (
          <div className="mt-4">
            <FileCard
              fileName={wordFile.name}
              fileSize={wordFile.size}
              onRemove={reset}
              disabled={isProcessing || isLoading}
              showIcon={true}
            />
          </div>
        )}
      </div>

      <div className="mb-4">
        <ProcessMessages success={null} error={error} />
      </div>

      <div className="flex gap-4">
        {canConvert && (
          <ProcessButton
            onClick={convertAndDownloadPdf}
            disabled={!canConvert}
            isProcessing={isLoading || isProcessing}
            loadingMessage={loadingMessage || processingMessage}
          >
            Convert to PDF
          </ProcessButton>
        )}

        {wordFile && (
          <Button
            onClick={reset}
            disabled={isProcessing || isLoading}
            variant="outline"
          >
            Reset
          </Button>
        )}
      </div>

      <ProcessLoadingModal
        isProcessing={isLoading || isProcessing}
        loadingMessage={loadingMessage || processingMessage}
      />
    </div>
  );
};

