'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, X } from 'lucide-react';
import { formatBytes } from '@/lib/pdf/file-utils';
import { cn } from '@/lib/utils';

export interface FileCardProps {
  fileName: string;
  fileSize: number;
  onRemove: () => void;
  disabled?: boolean;
  showIcon?: boolean;
  className?: string;
}

export const FileCard = ({
  fileName,
  fileSize,
  onRemove,
  disabled = false,
  showIcon = true,
  className,
}: FileCardProps) => {
  return (
    <Card className={cn('bg-input border-border', className)}>
      <CardContent className="p-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {showIcon && (
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="truncate font-medium text-foreground text-sm">
              {fileName}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatBytes(fileSize)}
            </span>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
          aria-label={`Remove ${fileName}`}
          title={`Remove ${fileName}`}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </button>
      </CardContent>
    </Card>
  );
};

