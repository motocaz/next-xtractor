"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  CopyPlus,
  XCircle,
  RotateCw,
  RotateCcw,
  FilePlus,
  Scissors,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import type { MultiToolPageData } from "../types";

interface MultiToolPageCardProps {
  pageData: MultiToolPageData;
  pageNumber: number;
  isSelected: boolean;
  hasSplitMarker: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  onRotate: (delta: number) => void;
  onInsertPDF?: () => void;
  onToggleSplit?: () => void;
  canDelete: boolean;
}

export const MultiToolPageCard = ({
  pageData,
  pageNumber,
  isSelected,
  hasSplitMarker,
  onSelect,
  onDelete,
  onDuplicate,
  onRotate,
  onInsertPDF,
  onToggleSplit,
  canDelete,
}: MultiToolPageCardProps) => {
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
      className={`relative cursor-move flex flex-col items-center gap-2 group bg-input rounded-lg border-2 p-2 transition-colors ${
        isSelected
          ? "border-primary ring-2 ring-primary"
          : "border-border hover:border-primary"
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 rounded bg-background/80 backdrop-blur-sm"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute top-2 left-2 z-10 p-1 rounded bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
        aria-label={isSelected ? "Deselect page" : "Select page"}
      >
        {isSelected ? (
          <CheckSquare className="h-4 w-4 text-primary" />
        ) : (
          <Square className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      <div className="absolute top-1 left-1/2 -translate-x-1/2 z-10 bg-gray-900/75 dark:bg-gray-100/75 text-white dark:text-gray-900 text-xs rounded-full px-2 py-1 font-semibold">
        {pageNumber}
      </div>

      {hasSplitMarker && (
        <div className="absolute -right-3 top-0 bottom-0 w-6 flex items-center justify-center z-20 pointer-events-none">
          <div className="h-full w-0.5 border-l-2 border-dashed border-primary" />
        </div>
      )}

      <div
        {...listeners}
        className="relative w-full h-36 bg-background rounded-lg flex items-center justify-center overflow-hidden border border-border cursor-grab active:cursor-grabbing"
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `rotate(${pageData.visualRotation}deg)`,
            transition: "transform 0.2s ease",
          }}
        >
          {pageData.thumbnailUrl ? (
            <Image
              src={pageData.thumbnailUrl}
              alt={`Page ${pageData.pageIndex + 1} from ${pageData.fileName}`}
              className="object-contain"
              fill
              unoptimized
            />
          ) : pageData.isBlankPage ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
              Blank Page
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="animate-pulse text-xs">Loading...</div>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground truncate w-full text-center">
        {pageData.fileName || "Blank Page"}
      </p>

      <div
        role="toolbar"
        aria-label="Page actions"
        tabIndex={-1}
        className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.stopPropagation();
          }
        }}
      >
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onRotate(-90);
          }}
          aria-label="Rotate left"
          title="Rotate Left"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onRotate(90);
          }}
          aria-label="Rotate right"
          title="Rotate Right"
        >
          <RotateCw className="h-3.5 w-3.5" />
        </Button>
        {onDuplicate && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            aria-label="Duplicate page"
            title="Duplicate Page"
          >
            <CopyPlus className="h-3.5 w-3.5" />
          </Button>
        )}
        {onInsertPDF && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onInsertPDF();
            }}
            aria-label="Insert PDF after this page"
            title="Insert PDF"
          >
            <FilePlus className="h-3.5 w-3.5" />
          </Button>
        )}
        {onToggleSplit && (
          <Button
            type="button"
            size="icon"
            variant={hasSplitMarker ? "default" : "ghost"}
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSplit();
            }}
            aria-label="Toggle split marker"
            title="Toggle Split Marker"
          >
            <Scissors className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          type="button"
          size="icon"
          variant="destructive"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={!canDelete}
          aria-label="Delete page"
          title={canDelete ? "Delete Page" : "Cannot delete the last page"}
        >
          <XCircle className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
