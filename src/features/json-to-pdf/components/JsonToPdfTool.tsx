'use client';

import Link from 'next/link';
import { useJsonToPdf } from '../hooks/useJsonToPdf';
import { FileUploader } from '@/components/FileUploader';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, ArrowLeft, X, AlertTriangle } from 'lucide-react';
import { formatBytes } from '@/lib/pdf/file-utils';
import { FileUploadStatusMessages } from '@/components/common/FileUploadStatusMessages';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';

export const JsonToPdfTool = () => {
  const {
    jsonFiles,
    isLoading,
    isProcessing,
    loadingMessage,
    error,
    success,
    loadJsonFiles,
    removeJsonFile,
    processJsonToPdf,
  } = useJsonToPdf();

  const canProcess = jsonFiles.length > 0 && !isProcessing && !isLoading;

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
        JSON to PDF Converter
      </h2>
      <p className="mb-6 text-muted-foreground">
        Upload multiple JSON files to convert them all to PDF format. Files will
        be downloaded as a ZIP archive.
      </p>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-yellow-600 dark:text-yellow-400 text-sm">
            <strong>Note:</strong> Only JSON files created by the PDF-to-JSON
            converter tool are supported. Standard JSON files from other tools
            will not work.
          </p>
        </div>
      </div>

      <div className="mb-4">
        <FileUploader
          accept="application/json"
          multiple={true}
          onFilesSelected={async (files) => {
            if (files.length > 0) {
              await loadJsonFiles(files);
            }
          }}
          disabled={isLoading || isProcessing}
        />
      </div>

      <FileUploadStatusMessages
        isLoading={isLoading}
        loadingMessage={loadingMessage}
        defaultLoadingText="Loading JSON files..."
        error={error}
        success={success}
      />

      {jsonFiles.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            JSON Files ({jsonFiles.length})
          </h3>
          <div className="space-y-2">
            {jsonFiles.map((fileInfo) => (
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
                    onClick={() => removeJsonFile(fileInfo.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                    aria-label={`Remove ${fileInfo.fileName}`}
                    title="Remove JSON file"
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

      {jsonFiles.length > 0 && (
        <ProcessButton
          onClick={processJsonToPdf}
          disabled={!canProcess}
          isProcessing={isProcessing}
          loadingMessage={loadingMessage}
        >
          Convert to PDF
        </ProcessButton>
      )}

      <ProcessLoadingModal
        isProcessing={isProcessing}
        loadingMessage={loadingMessage}
      />
    </div>
  );
};

