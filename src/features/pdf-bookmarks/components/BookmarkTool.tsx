"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import { useBookmarkTool } from "../hooks/useBookmarkTool";
import { useBookmarkDialogs } from "../hooks/useBookmarkDialogs";
import { PDFViewer } from "./PDFViewer";
import { BookmarkTree } from "./BookmarkTree";
import { BookmarkEditModal } from "./BookmarkEditModal";
import { DestinationPicker } from "./DestinationPicker";
import { UploadSection } from "./UploadSection";
import { MessageDialog } from "./MessageDialog";
import { ConfirmDialog } from "./ConfirmDialog";
import { BookmarkToolHeader } from "./BookmarkToolHeader";
import { MobileViewToggle } from "./MobileViewToggle";
import { BookmarkInputSection } from "./BookmarkInputSection";
import { BatchModeControls } from "./BatchModeControls";
import { ImportExportButtons } from "./ImportExportButtons";
import { BookmarkActions } from "./BookmarkActions";
import type { BookmarkNode } from "../types";

export const BookmarkTool = () => {
  const {
    bookmarkTree,
    searchQuery,
    batchMode,
    selectedBookmarks,
    collapsedNodes,
    isPickingDestination,
    destinationMarker,
    currentPage,
    originalFileName,
    pdfLoaded,
    error,
    pdfViewer,
    canUndo,
    canRedo,
    loadPDF,
    addBookmark,
    editBookmark,
    deleteBookmark,
    deleteSelectedBookmarks,
    addChildBookmark,
    reorderBookmarks,
    navigateToBookmark,
    setSearchQuery,
    toggleBatchMode,
    toggleSelectBookmark,
    selectAllBookmarks,
    deselectAllBookmarks,
    applyBatchColor,
    applyBatchStyle,
    toggleCollapse,
    expandAll,
    collapseAll,
    importCSV,
    importJSON,
    exportCSV,
    exportJSON,
    extractExisting,
    savePDF,
    undo,
    redo,
    reset,
    startDestinationPicking,
    cancelDestinationPicking,
    setDestination,
    updateCurrentPage,
    pendingImport,
    clearPendingImport,
  } = useBookmarkTool();

  const { messageDialog, setMessageDialog, confirmDialog, setConfirmDialog } =
    useBookmarkDialogs();

  const [autoExtract, setAutoExtract] = useState(true);
  const [bookmarkTitle, setBookmarkTitle] = useState("");
  const [editingBookmark, setEditingBookmark] = useState<BookmarkNode | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showViewer, setShowViewer] = useState(true);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<
    string | null
  >(null);
  const [pendingDestinationData, setPendingDestinationData] = useState<{
    destPage: number;
    destX: number | null;
    destY: number | null;
    zoom: string | null;
  } | null>(null);

  const previousPendingImportRef = useRef<typeof pendingImport>(null);

  useEffect(() => {
    if (
      pdfLoaded &&
      previousPendingImportRef.current &&
      !pendingImport &&
      bookmarkTree.length > 0
    ) {
      const fileName = previousPendingImportRef.current.fileName;
      setImportSuccessMessage(
        `Bookmarks from "${fileName}" applied successfully! ${bookmarkTree.length} bookmark(s) loaded.`
      );
      setTimeout(() => setImportSuccessMessage(null), 3000);
      previousPendingImportRef.current = null;
    } else if (pendingImport && !pdfLoaded) {
      previousPendingImportRef.current = pendingImport;
    }
  }, [pdfLoaded, pendingImport, bookmarkTree.length]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowViewer(true);
        setShowBookmarks(true);
      } else if (!showViewer && !showBookmarks) {
        setShowViewer(true);
        setShowBookmarks(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [showViewer, showBookmarks]);

  const handlePDFSelected = async (file: File) => {
    await loadPDF(file, autoExtract);
  };

  const handleCSVSelected = async (file: File) => {
    try {
      await importCSV(file);
      if (pdfLoaded) {
        setTimeout(() => {
          setImportSuccessMessage(
            `CSV imported successfully! ${bookmarkTree.length} bookmark(s) loaded.`
          );
          setTimeout(() => setImportSuccessMessage(null), 3000);
        }, 100);
      }
    } catch (err) {
      setMessageDialog({
        open: true,
        type: "error",
        title: "Import Failed",
        message:
          "Failed to import CSV: " +
          (err instanceof Error ? err.message : "Unknown error"),
      });
    }
  };

  const handleJSONSelected = async (file: File) => {
    try {
      await importJSON(file);
      if (pdfLoaded) {
        setTimeout(() => {
          setImportSuccessMessage(
            `JSON imported successfully! ${bookmarkTree.length} bookmark(s) loaded.`
          );
          setTimeout(() => setImportSuccessMessage(null), 3000);
        }, 100);
      }
    } catch (err) {
      setMessageDialog({
        open: true,
        type: "error",
        title: "Import Failed",
        message:
          "Failed to import JSON: " +
          (err instanceof Error ? err.message : "Unknown error"),
      });
    }
  };

  const handleAddBookmark = () => {
    if (!bookmarkTitle.trim()) {
      setMessageDialog({
        open: true,
        type: "info",
        title: "Validation Error",
        message: "Please enter a bookmark title.",
      });
      return;
    }
    addBookmark(bookmarkTitle.trim(), currentPage);
    setBookmarkTitle("");
  };

  const handleEditBookmark = (node: BookmarkNode) => {
    setEditingBookmark(node);
    setIsEditModalOpen(true);
  };

  const handleDeleteBookmark = async (id: string) => {
    const node = bookmarkTree.find((n) => n.id === id);
    if (node) {
      setConfirmDialog({
        open: true,
        title: "Delete Bookmark",
        message: `Delete "${node.title}"? This action cannot be undone.`,
        onConfirm: () => {
          deleteBookmark(id);
        },
        variant: "destructive",
      });
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedBookmarks.size === 0) return;
    setConfirmDialog({
      open: true,
      title: "Delete Selected Bookmarks",
      message: `Delete ${selectedBookmarks.size} bookmark(s)? This action cannot be undone.`,
      onConfirm: () => {
        deleteSelectedBookmarks();
      },
      variant: "destructive",
    });
  };

  const handleDeleteAll = () => {
    const ids = bookmarkTree.map((node) => node.id);
    ids.forEach((id) => deleteBookmark(id));
  };

  const handleEditConfirm = (data: {
    title: string;
    color: string | null;
    style: string | null;
    destPage: number;
    destX: number | null;
    destY: number | null;
    zoom: string | null;
  }) => {
    if (editingBookmark) {
      editBookmark(editingBookmark.id, data);
    } else {
      addBookmark(data.title, data.destPage);
    }
    setEditingBookmark(null);
    setIsEditModalOpen(false);
  };

  const handleStartDestinationPicking = () => {
    startDestinationPicking();
    setPendingDestinationData({
      destPage: editingBookmark?.page || currentPage,
      destX: editingBookmark?.destX || null,
      destY: editingBookmark?.destY || null,
      zoom: editingBookmark?.zoom || null,
    });
  };

  const handleCanvasClick = (x: number, y: number, page: number) => {
    if (isPickingDestination) {
      setPendingDestinationData({
        destPage: page,
        destX: x,
        destY: y,
        zoom: pendingDestinationData?.zoom || null,
      });
      setDestination(x, y, page);
      setTimeout(() => {
        setIsEditModalOpen(true);
      }, 100);
    }
  };

  const handleSavePDF = async () => {
    try {
      await savePDF();
      setMessageDialog({
        open: true,
        type: "success",
        title: "Success",
        message: "PDF saved successfully!",
      });
      setTimeout(() => {
        reset();
      }, 500);
    } catch (err) {
      setMessageDialog({
        open: true,
        type: "error",
        title: "Error",
        message:
          "Error saving PDF: " +
          (err instanceof Error ? err.message : "Unknown error"),
      });
    }
  };

  const handleExtractExisting = async () => {
    try {
      await extractExisting();
      setMessageDialog({
        open: true,
        type: "success",
        title: "Success",
        message: "Bookmarks extracted successfully!",
      });
    } catch (err) {
      setMessageDialog({
        open: true,
        type: "error",
        title: "Error",
        message:
          "Error extracting bookmarks: " +
          (err instanceof Error ? err.message : "Unknown error"),
      });
    }
  };

  if (!pdfLoaded) {
    return (
      <UploadSection
        onPDFSelected={handlePDFSelected}
        onCSVSelected={handleCSVSelected}
        onJSONSelected={handleJSONSelected}
        autoExtract={autoExtract}
        onAutoExtractChange={setAutoExtract}
        pendingImport={pendingImport}
        onClearPendingImport={clearPendingImport}
      />
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <BookmarkToolHeader
        originalFileName={originalFileName}
        canUndo={canUndo}
        canRedo={canRedo}
        bookmarkTree={bookmarkTree}
        onUndo={undo}
        onRedo={redo}
        onDeleteAll={handleDeleteAll}
        onReset={reset}
        setMessageDialog={setMessageDialog}
        setConfirmDialog={setConfirmDialog}
      />

      <MobileViewToggle
        showViewer={showViewer}
        showBookmarks={showBookmarks}
        onToggleViewer={() => {
          setShowViewer(true);
          setShowBookmarks(false);
        }}
        onToggleBookmarks={() => {
          setShowViewer(false);
          setShowBookmarks(true);
        }}
      />

      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {(showViewer || window.innerWidth >= 1024) && (
            <div className="w-full lg:w-[50%] shrink-0">
              <DestinationPicker
                isActive={isPickingDestination}
                onCancel={cancelDestinationPicking}
              />
              <PDFViewer
                pdfViewer={pdfViewer}
                onPageChange={(page) => {
                  updateCurrentPage(page);
                }}
                onCanvasClick={handleCanvasClick}
                isPickingDestination={isPickingDestination}
                destinationMarker={destinationMarker}
              />
            </div>
          )}

          {(showBookmarks || window.innerWidth >= 1024) && (
            <div className="w-full lg:w-[50%] shrink-0">
              <BookmarkInputSection
                bookmarkTitle={bookmarkTitle}
                currentPage={currentPage}
                onTitleChange={setBookmarkTitle}
                onAddBookmark={handleAddBookmark}
              />

              <BatchModeControls
                batchMode={batchMode}
                selectedBookmarks={selectedBookmarks}
                onToggleBatchMode={toggleBatchMode}
                onSelectAll={selectAllBookmarks}
                onDeselectAll={deselectAllBookmarks}
                onApplyColor={applyBatchColor}
                onApplyStyle={applyBatchStyle}
                onDeleteSelected={handleDeleteSelected}
              />

              <ImportExportButtons
                onImportCSV={handleCSVSelected}
                onImportJSON={handleJSONSelected}
                onExportCSV={exportCSV}
                onExportJSON={exportJSON}
                onError={(error) => {
                  setMessageDialog({
                    open: true,
                    type: "error",
                    title: "Export Failed",
                    message: "Error exporting: " + error.message,
                  });
                }}
              />

              {importSuccessMessage && (
                <div className="mb-4 p-2 bg-green-500/10 border border-green-500/20 rounded-md text-sm text-green-700 dark:text-green-400 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{importSuccessMessage}</span>
                  </div>
                </div>
              )}

              <BookmarkTree
                bookmarkTree={bookmarkTree}
                searchQuery={searchQuery}
                batchMode={batchMode}
                selectedBookmarks={selectedBookmarks}
                collapsedNodes={collapsedNodes}
                onSearchChange={setSearchQuery}
                onToggleSelect={toggleSelectBookmark}
                onToggleCollapse={toggleCollapse}
                onEdit={handleEditBookmark}
                onDelete={handleDeleteBookmark}
                onAddChild={(node) => {
                  const title = prompt("Enter child bookmark title:");
                  if (title) {
                    addChildBookmark(node.id, title);
                  }
                }}
                onNavigate={navigateToBookmark}
                onReorder={reorderBookmarks}
                onExpandAll={expandAll}
                onCollapseAll={collapseAll}
              />

              <BookmarkActions
                onSavePDF={handleSavePDF}
                onExtractExisting={handleExtractExisting}
              />
            </div>
          )}
        </div>
      </div>

      <BookmarkEditModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingBookmark(null);
          setPendingDestinationData(null);
          cancelDestinationPicking();
        }}
        onConfirm={(data) => {
          const finalData =
            pendingDestinationData &&
            (pendingDestinationData.destX !== null ||
              pendingDestinationData.destY !== null)
              ? {
                  ...data,
                  destPage: pendingDestinationData.destPage,
                  destX: pendingDestinationData.destX,
                  destY: pendingDestinationData.destY,
                  zoom: pendingDestinationData.zoom,
                }
              : data;
          handleEditConfirm(finalData);
          setPendingDestinationData(null);
        }}
        bookmark={editingBookmark}
        maxPages={pdfViewer.getTotalPages()}
        currentPage={currentPage}
        onStartDestinationPicking={handleStartDestinationPicking}
        isPickingDestination={isPickingDestination}
      />

      {error && (
        <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground p-4 rounded-lg shadow-lg">
          {error}
        </div>
      )}

      <MessageDialog
        open={messageDialog.open}
        onOpenChange={(open) => setMessageDialog((prev) => ({ ...prev, open }))}
        type={messageDialog.type}
        title={messageDialog.title}
        message={messageDialog.message}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        variant={confirmDialog.variant}
      />
    </div>
  );
};
