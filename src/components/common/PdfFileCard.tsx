'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, X } from 'lucide-react';
import { formatBytes } from '@/lib/pdf/file-utils';

export interface PdfFileCardProps {
  pdfFile: File;
  totalPages: number;
  onRemove: () => void;
  disabled?: boolean;
  className?: string;
}

export const PdfFileCard = ({
  pdfFile,
  totalPages,
  onRemove,
  disabled = false,
  className,
}: PdfFileCardProps) => {
  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-foreground mb-3">
        PDF File
      </h3>
      <Card className="bg-input border-border">
        <CardContent className="p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="truncate font-medium text-foreground text-sm">
                {pdfFile.name}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatBytes(pdfFile.size)}</span>
                {totalPages > 0 && (
                  <>
                    <span>•</span>
                    <span>{totalPages} page{totalPages !== 1 ? 's' : ''}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
            aria-label={`Remove ${pdfFile.name}`}
            title="Remove PDF file"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

