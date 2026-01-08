"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, CopyPlus, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PageThumbnailData } from "@/lib/pdf/organize-pages-utils";
import Image from "next/image";

interface PageThumbnailProps {
  pageData: PageThumbnailData;
  thumbnailUrl?: string;
  onDelete: () => void;
  canDelete: boolean;
  onDuplicate?: () => void;
}

export const PageThumbnail = ({
  pageData,
  thumbnailUrl,
  onDelete,
  canDelete,
  onDuplicate,
}: PageThumbnailProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pageData.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative cursor-move flex flex-col items-center gap-2 group"
    >
      <div
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-background/80 backdrop-blur-sm pointer-events-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="absolute top-1 left-1 z-10 bg-gray-900/75 dark:bg-gray-100/75 text-white dark:text-gray-900 text-xs rounded-full px-2 py-1 font-semibold pointer-events-none">
        {pageData.displayNumber}
      </div>

      <div
        {...attributes}
        {...listeners}
        className="relative w-full h-36 bg-background rounded-lg flex items-center justify-center overflow-hidden border-2 border-border hover:border-primary transition-colors cursor-grab active:cursor-grabbing"
      >
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={`Page ${pageData.displayNumber}`}
            className="object-contain pointer-events-none"
            fill
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="animate-pulse">Loading...</div>
          </div>
        )}
      </div>

      <div
        className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {onDuplicate && (
          <Button
            type="button"
            size="icon"
            variant="default"
            className="h-8 w-8 rounded-full bg-green-600 hover:bg-green-700 text-white"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            aria-label={`Duplicate page ${pageData.displayNumber}`}
            title="Duplicate Page"
          >
            <CopyPlus className="h-4 w-4" />
          </Button>
        )}
        <Button
          type="button"
          size="icon"
          variant="destructive"
          className="h-8 w-8 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={!canDelete}
          aria-label={`Delete page ${pageData.displayNumber}`}
          title={canDelete ? "Delete Page" : "Cannot delete the last page"}
        >
          <XCircle className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
