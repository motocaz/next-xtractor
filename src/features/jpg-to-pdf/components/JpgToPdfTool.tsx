'use client';

import Link from 'next/link';
import { useJpgToPdf } from '../hooks/useJpgToPdf';
import { FileUploader } from '@/components/FileUploader';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, ArrowLeft, X } from 'lucide-react';
import { formatBytes } from '@/lib/pdf/file-utils';
import { FileUploadStatusMessages } from '@/components/common/FileUploadStatusMessages';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';

export const JpgToPdfTool = () => {
  const {
    jpgFiles,
    isLoading,
    isProcessing,
    loadingMessage,
    error,
    success,
    failedFiles,
    loadJpgFiles,
    removeJpgFile,
    processJpgToPdf,
  } = useJpgToPdf();

  const canProcess = jpgFiles.length > 0 && !isProcessing && !isLoading;

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
        JPG to PDF
      </h2>
      <p className="mb-6 text-muted-foreground">
        Create a PDF from one or more JPG images.
      </p>

      <div className="mb-4">
        <FileUploader
          accept="image/jpeg,image/jpg"
          multiple={true}
          onFilesSelected={async (files) => {
            if (files.length > 0) {
              await loadJpgFiles(files);
            }
          }}
          disabled={isLoading || isProcessing}
        />
      </div>

      <FileUploadStatusMessages
        isLoading={isLoading}
        loadingMessage={loadingMessage}
        defaultLoadingText="Loading JPG files..."
        error={error}
        success={success}
        failedFiles={failedFiles}
      />

      {jpgFiles.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            JPG Files ({jpgFiles.length})
          </h3>
          <div className="space-y-2">
            {jpgFiles.map((fileInfo) => (
              <Card
                key={fileInfo.id}
                className="bg-input border-border"
              >
                <CardContent className="p-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium text-foreground text-sm">
                        {fileInfo.fileName}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatBytes(fileInfo.fileSize)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeJpgFile(fileInfo.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                    aria-label={`Remove ${fileInfo.fileName}`}
                    title="Remove JPG file"
                    disabled={isProcessing}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {jpgFiles.length > 0 && (
        <ProcessButton
          onClick={processJpgToPdf}
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

