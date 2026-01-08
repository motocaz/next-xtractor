"use client";

import {
  RotateCcw,
  RotateCw,
  Trash2,
  CopyPlus,
  Scissors,
  Download,
  CheckSquare,
  Square,
  Undo,
  Redo,
  RefreshCw,
  FilePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MultiToolToolbarProps {
  selectedCount: number;
  canUndo: boolean;
  canRedo: boolean;
  isProcessing: boolean;
  isRendering: boolean;
  onBulkRotateLeft: () => void;
  onBulkRotateRight: () => void;
  onBulkDelete: () => void;
  onBulkDuplicate: () => void;
  onBulkSplit: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDownloadSelected: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onDownloadAll: () => void;
  onAddBlankPage: () => void;
}

export const MultiToolToolbar = ({
  selectedCount,
  canUndo,
  canRedo,
  isProcessing,
  isRendering,
  onBulkRotateLeft,
  onBulkRotateRight,
  onBulkDelete,
  onBulkDuplicate,
  onBulkSplit,
  onSelectAll,
  onDeselectAll,
  onDownloadSelected,
  onUndo,
  onRedo,
  onReset,
  onDownloadAll,
  onAddBlankPage,
}: MultiToolToolbarProps) => {
  const disabled = isProcessing || isRendering;
  const hasSelection = selectedCount > 0;

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-input rounded-lg border border-border">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">
          Bulk Actions:
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onBulkRotateLeft}
          disabled={disabled || !hasSelection}
          title="Rotate selected pages left"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Rotate Left
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onBulkRotateRight}
          disabled={disabled || !hasSelection}
          title="Rotate selected pages right"
        >
          <RotateCw className="h-4 w-4 mr-1" />
          Rotate Right
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onBulkDelete}
          disabled={disabled || !hasSelection}
          title="Delete selected pages"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onBulkDuplicate}
          disabled={disabled || !hasSelection}
          title="Duplicate selected pages"
        >
          <CopyPlus className="h-4 w-4 mr-1" />
          Duplicate
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onBulkSplit}
          disabled={disabled || !hasSelection}
          title="Mark selected pages for splitting"
        >
          <Scissors className="h-4 w-4 mr-1" />
          Split
        </Button>
      </div>

      <div className="w-px h-6 bg-border" />

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">Selection:</span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onSelectAll}
          disabled={disabled}
          title="Select all pages"
        >
          <CheckSquare className="h-4 w-4 mr-1" />
          Select All
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onDeselectAll}
          disabled={disabled}
          title="Deselect all pages"
        >
          <Square className="h-4 w-4 mr-1" />
          Deselect All
        </Button>
        {hasSelection && (
          <span className="text-sm text-muted-foreground">
            ({selectedCount} selected)
          </span>
        )}
      </div>

      <div className="w-px h-6 bg-border" />

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">History:</span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onUndo}
          disabled={disabled || !canUndo}
          title="Undo last action"
        >
          <Undo className="h-4 w-4 mr-1" />
          Undo
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onRedo}
          disabled={disabled || !canRedo}
          title="Redo last action"
        >
          <Redo className="h-4 w-4 mr-1" />
          Redo
        </Button>
      </div>

      <div className="w-px h-6 bg-border" />

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onAddBlankPage}
          disabled={disabled}
          title="Add blank page"
        >
          <FilePlus className="h-4 w-4 mr-1" />
          Add Blank
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onReset}
          disabled={disabled}
          title="Reset all changes"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>

      <div className="w-px h-6 bg-border" />

      <div className="flex items-center gap-2 ml-auto">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onDownloadSelected}
          disabled={disabled || !hasSelection}
          title="Download selected pages"
        >
          <Download className="h-4 w-4 mr-1" />
          Download Selected
        </Button>
        <Button
          type="button"
          size="sm"
          variant="default"
          onClick={onDownloadAll}
          disabled={disabled}
          title="Download all pages"
        >
          <Download className="h-4 w-4 mr-1" />
          Download All
        </Button>
      </div>
    </div>
  );
};
