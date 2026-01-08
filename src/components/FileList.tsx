'use client';

import { useMemo } from 'react';
import { formatBytes } from '@/lib/pdf/file-utils';
import { cn } from '@/lib/utils';

export interface FileListItem {
  name: string;
  size: number;
}

export interface FileListProps {
  files: FileListItem[] | File[] | Array<{ name: string; size: number }>;
  onRemove?: (index: number) => void;
  className?: string;
}

export const FileList = ({ files, onRemove, className }: FileListProps) => {
  const normalizedFiles = useMemo(() => {
    if (files.length === 0) return [];
    
    if (files[0] instanceof File) {
      return (files as File[]).map((file) => ({
        name: file.name,
        size: file.size,
      }));
    }
    
    return files.map((file) => ({
      name: file.name,
      size: file.size,
    }));
  }, [files]);

  if (normalizedFiles.length === 0) {
    return null;
  }

  return (
    <div className={cn('mt-4 space-y-2', className)}>
      {normalizedFiles.map((file, index) => (
        <div
          key={`${file.name}-${index}`}
          className="flex justify-between items-center p-2 bg-input rounded-md text-foreground"
        >
          <span className="truncate text-sm flex-1 mr-2">{file.name}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {formatBytes(file.size)}
            </span>
            {onRemove && (
              <button
                onClick={() => onRemove(index)}
                className="text-destructive hover:text-destructive/80 text-xl px-2 py-1 rounded"
                aria-label={`Remove ${file.name}`}
              >
                ×
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

