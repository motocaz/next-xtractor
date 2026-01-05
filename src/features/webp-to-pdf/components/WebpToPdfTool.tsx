'use client';

import Link from 'next/link';
import { useWebpToPdf } from '../hooks/useWebpToPdf';
import { FileUploader } from '@/components/FileUploader';
import { ArrowLeft } from 'lucide-react';
import { FileUploadStatusMessages } from '@/components/common/FileUploadStatusMessages';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';
import { FileListSection } from '@/components/common/FileListSection';

export const WebpToPdfTool = () => {
  const {
    webpFiles,
    isLoading,
    isProcessing,
    loadingMessage,
    error,
    success,
    failedFiles,
    loadWebpFiles,
    removeWebpFile,
    processWebpToPdf,
  } = useWebpToPdf();

  const canProcess = webpFiles.length > 0 && !isProcessing && !isLoading;

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
        WebP to PDF
      </h2>
      <p className="mb-6 text-muted-foreground">
        Convert one or more WebP images into a single PDF file.
      </p>

      <div className="mb-4">
        <FileUploader
          accept="image/webp"
          multiple={true}
          onFilesSelected={async (files) => {
            if (files.length > 0) {
              await loadWebpFiles(files);
            }
          }}
          disabled={isLoading || isProcessing}
        />
      </div>

      <FileUploadStatusMessages
        isLoading={isLoading}
        loadingMessage={loadingMessage}
        defaultLoadingText="Loading WebP files..."
        error={error}
        success={success}
        failedFiles={failedFiles}
      />

      {webpFiles.length > 0 && (
        <FileListSection
          title="WebP Files"
          files={webpFiles}
          onRemove={removeWebpFile}
          disabled={isProcessing}
          showIcon={true}
          className="mb-4"
        />
      )}

      {webpFiles.length > 0 && (
        <ProcessButton
          onClick={processWebpToPdf}
          disabled={!canProcess}
          isProcessing={isProcessing}
          loadingMessage={loadingMessage}
        >
          Convert & Download
        </ProcessButton>
      )}

      <ProcessLoadingModal
        isProcessing={isProcessing}
        loadingMessage={loadingMessage}
      />
    </div>
  );
};

