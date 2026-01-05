'use client';

import Link from 'next/link';
import { useScanToPdf } from '../hooks/useScanToPdf';
import { FileUploader } from '@/components/FileUploader';
import { ArrowLeft } from 'lucide-react';
import { FileUploadStatusMessages } from '@/components/common/FileUploadStatusMessages';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';
import { FileListSection } from '@/components/common/FileListSection';

export const ScanToPdfTool = () => {
  const {
    imageFiles,
    isLoading,
    isProcessing,
    loadingMessage,
    error,
    success,
    failedFiles,
    loadImageFiles,
    removeImageFile,
    processImageToPdf,
  } = useScanToPdf();

  const canProcess = imageFiles.length > 0 && !isProcessing && !isLoading;

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
        Scan to PDF
      </h2>
      <p className="mb-6 text-muted-foreground">
        Use your device&apos;s camera to scan documents and save them as a PDF. On desktop, this will open a file picker.
      </p>

      <div className="mb-4">
        <FileUploader
          accept="image/*"
          multiple={true}
          onFilesSelected={async (files) => {
            if (files.length > 0) {
              await loadImageFiles(files);
            }
          }}
          disabled={isLoading || isProcessing}
        />
      </div>

      <FileUploadStatusMessages
        isLoading={isLoading}
        loadingMessage={loadingMessage}
        defaultLoadingText="Loading image files..."
        error={error}
        success={success}
        failedFiles={failedFiles}
      />

      {imageFiles.length > 0 && (
        <FileListSection
          title="Scanned Images"
          files={imageFiles}
          onRemove={removeImageFile}
          disabled={isProcessing}
          showIcon={true}
          className="mb-4"
        />
      )}

      {imageFiles.length > 0 && (
        <ProcessButton
          onClick={processImageToPdf}
          disabled={!canProcess}
          isProcessing={isProcessing}
          loadingMessage={loadingMessage}
        >
          Create PDF from Scans
        </ProcessButton>
      )}

      <ProcessLoadingModal
        isProcessing={isProcessing}
        loadingMessage={loadingMessage}
      />
    </div>
  );
};

