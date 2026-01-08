"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Undo2, Redo2, Trash2, RotateCcw } from "lucide-react";
import type { BookmarkNode } from "../types";
import type {
  MessageDialogState,
  ConfirmDialogState,
} from "../hooks/useBookmarkDialogs";

interface BookmarkToolHeaderProps {
  originalFileName: string;
  canUndo: boolean;
  canRedo: boolean;
  bookmarkTree: BookmarkNode[];
  onUndo: () => void;
  onRedo: () => void;
  onDeleteAll: () => void;
  onReset: () => void;
  setMessageDialog: (dialog: MessageDialogState) => void;
  setConfirmDialog: (dialog: ConfirmDialogState) => void;
}

export const BookmarkToolHeader = ({
  originalFileName,
  canUndo,
  canRedo,
  bookmarkTree,
  onUndo,
  onRedo,
  onDeleteAll,
  onReset,
  setMessageDialog,
  setConfirmDialog,
}: BookmarkToolHeaderProps) => {
  const handleDeleteAll = () => {
    if (bookmarkTree.length === 0) {
      setMessageDialog({
        open: true,
        type: "info",
        title: "No Bookmarks",
        message: "No bookmarks to delete.",
      });
      return;
    }
    setConfirmDialog({
      open: true,
      title: "Delete All Bookmarks",
      message: `Delete all ${bookmarkTree.length} bookmark(s)? This action cannot be undone.`,
      onConfirm: onDeleteAll,
      variant: "destructive",
    });
  };

  const handleReset = () => {
    setConfirmDialog({
      open: true,
      title: "Reset Editor",
      message:
        "Reset and go back to file uploader? All unsaved changes will be lost.",
      onConfirm: onReset,
      variant: "default",
    });
  };

  return (
    <header className="bg-background border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-xl font-bold text-foreground">
            {originalFileName || "PDF Bookmark Editor"}
          </h1>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" asChild>
              <Link href="/#tools-header">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Tools
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
            >
              <Undo2 className="h-4 w-4 mr-1" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
            >
              <Redo2 className="h-4 w-4 mr-1" />
              Redo
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteAll}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete All
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
