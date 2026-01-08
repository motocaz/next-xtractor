"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GripVertical, X } from "lucide-react";
import type { PDFFileInfo } from "@/hooks/useMultiPDFLoader";

interface SortableFileItemProps {
  pdfInfo: PDFFileInfo;
  pageRange: string;
  onRemove: (id: string) => void;
  onPageRangeChange: (fileId: string, range: string) => void;
}

export const SortableFileItem = ({
  pdfInfo,
  pageRange,
  onRemove,
  onPageRangeChange,
}: SortableFileItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pdfInfo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const safeFileName = pdfInfo.fileName.replace(/[^a-zA-Z0-9]/g, "_");
  const inputId = `range-${safeFileName}`;

  return (
    <Card ref={setNodeRef} style={style} className="bg-input border-accent">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              {...attributes}
              {...listeners}
              className="cursor-move text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
              aria-label="Drag handle"
            >
              <GripVertical className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span
                className="truncate font-medium text-foreground text-sm block"
                title={pdfInfo.fileName}
              >
                {pdfInfo.fileName}
              </span>
              <span className="text-xs text-muted-foreground">
                {pdfInfo.pageCount} {pdfInfo.pageCount === 1 ? "page" : "pages"}
              </span>
            </div>
          </div>
          <button
            onClick={() => onRemove(pdfInfo.id)}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded shrink-0"
            aria-label={`Remove ${pdfInfo.fileName}`}
            title="Remove PDF"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1">
          <Label htmlFor={inputId} className="text-xs text-muted-foreground">
            Pages (e.g., 1-3, 5) - Total: {pdfInfo.pageCount}
          </Label>
          <Input
            id={inputId}
            type="text"
            value={pageRange}
            onChange={(e) => onPageRangeChange(pdfInfo.id, e.target.value)}
            placeholder="Leave blank for all pages"
            className="w-full bg-background dark:bg-accent dark:placeholder:text-accent-foreground/70 border-accent-foreground/15 text-foreground text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
};
