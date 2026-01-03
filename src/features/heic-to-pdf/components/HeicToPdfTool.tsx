'use client';

import Link from 'next/link';
import { useHeicToPdf } from '../hooks/useHeicToPdf';
import { FileUploader } from '@/components/FileUploader';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, ArrowLeft, X } from 'lucide-react';
import { formatBytes } from '@/lib/pdf/file-utils';
import { FileUploadStatusMessages } from '@/components/common/FileUploadStatusMessages';

export const HeicToPdfTool = () => {
  const {
    heicFiles,
    isLoading,
    isProcessing,
    loadingMessage,
    error,
    success,
    failedFiles,
    loadHeicFiles,
    removeHeicFile,
    processHeicToPdf,
  } = useHeicToPdf();

  const canProcess = heicFiles.length > 0 && !isProcessing && !isLoading;

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
        HEIC to PDF
      </h2>
      <p className="mb-6 text-muted-foreground">
        Convert one or more HEIC (High Efficiency) images from your iPhone or camera into a single PDF file.
      </p>

      <div className="mb-4">
        <FileUploader
          accept=".heic,.heif"
          multiple={true}
          onFilesSelected={async (files) => {
            if (files.length > 0) {
              await loadHeicFiles(files);
            }
          }}
          disabled={isLoading || isProcessing}
        />
      </div>

      <FileUploadStatusMessages
        isLoading={isLoading}
        loadingMessage={loadingMessage}
        defaultLoadingText="Loading HEIC files..."
        error={error}
        success={success}
        failedFiles={failedFiles}
      />

      {heicFiles.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            HEIC Files ({heicFiles.length})
          </h3>
          <div className="space-y-2">
            {heicFiles.map((fileInfo) => (
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
                    onClick={() => removeHeicFile(fileInfo.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                    aria-label={`Remove ${fileInfo.fileName}`}
                    title="Remove HEIC file"
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

      {heicFiles.length > 0 && (
        <Button
          variant="gradient"
          className="w-full"
          onClick={processHeicToPdf}
          disabled={!canProcess}
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" />
              {loadingMessage || 'Processing...'}
            </span>
          ) : (
            'Convert & Download'
          )}
        </Button>
      )}

      {isProcessing && loadingMessage && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-foreground">{loadingMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

