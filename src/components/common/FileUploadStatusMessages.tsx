'use client';

import { Spinner } from '@/components/ui/spinner';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export interface FileUploadStatusMessagesProps {
  isLoading?: boolean;
  loadingMessage?: string | null;
  defaultLoadingText?: string;
  error?: string | null;
  success?: string | null;
  failedFiles?: string[];
  className?: string;
}

export const FileUploadStatusMessages = ({
  isLoading,
  loadingMessage,
  defaultLoadingText = 'Loading files...',
  error,
  success,
  failedFiles = [],
  className,
}: FileUploadStatusMessagesProps) => {
  return (
    <div className={className}>
      {isLoading && (
        <div className="flex items-center gap-2 p-3 bg-input rounded-md mb-4">
          <Spinner size="sm" />
          <span className="text-sm text-muted-foreground">
            {loadingMessage || defaultLoadingText}
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md mb-4">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <span className="text-sm text-destructive whitespace-pre-line">
            {error}
          </span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-md mb-4">
          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
          <span className="text-sm text-foreground">{success}</span>
        </div>
      )}

      {failedFiles.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md mb-4">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-1">
              Some files could not be processed:
            </p>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1">
              {failedFiles.map((fileName) => (
                <li key={fileName} className="truncate">
                  {fileName}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

