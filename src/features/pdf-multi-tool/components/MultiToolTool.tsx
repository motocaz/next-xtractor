"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { FileUploader } from "@/components/FileUploader";
import { ProcessMessages } from "@/components/common/ProcessMessages";
import { ProcessLoadingModal } from "@/components/common/ProcessLoadingModal";
import { Spinner } from "@/components/ui/spinner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useMultiTool } from "../hooks/useMultiTool";
import { MultiToolPageCard } from "./MultiToolPageCard";
import { MultiToolToolbar } from "./MultiToolToolbar";

export const MultiToolTool = () => {
  const {
    pages,
    selectedPages,
    splitMarkers,
    isLoading,
    isRendering,
    isProcessing,
    loadingMessage,
    error,
    success,
    loadPDFs,
    insertPDFAfter,
    toggleSelectPage,
    selectAll,
    deselectAll,
    rotatePage,
    duplicatePage,
    deletePage,
    addBlankPage,
    toggleSplitMarker,
    reorderPages,
    bulkRotate,
    bulkDelete,
    bulkDuplicate,
    bulkSplit,
    downloadSelected,
    downloadAll,
    canUndo,
    canRedo,
    undo,
    redo,
    reset,
  } = useMultiTool();

  const insertInputRef = useRef<HTMLInputElement>(null);
  const insertAfterPageIdRef = useRef<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      reorderPages(active.id as string, over.id as string);
    }
  };

  const handleInsertPDF = (pageId: string) => {
    insertAfterPageIdRef.current = pageId;
    insertInputRef.current?.click();
  };

  const handleInsertPDFChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !insertAfterPageIdRef.current) {
      event.target.value = "";
      return;
    }

    await insertPDFAfter(insertAfterPageIdRef.current, file);
    insertAfterPageIdRef.current = null;
    event.target.value = "";
  };

  const pageIds = pages.map((page) => page.id);
  const showPages = pages.length > 0 && !isRendering;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <Link
        href="/#tools-header"
        className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 font-semibold transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Tools</span>
      </Link>

      <h2 className="text-2xl font-bold text-foreground mb-4">
        PDF Multi-Tool
      </h2>
      <p className="mb-6 text-muted-foreground">
        Advanced page management: rotate, duplicate, split, and organize pages
        from multiple PDFs. Select pages, apply bulk actions, and download your
        organized PDFs.
      </p>

      <input
        ref={insertInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleInsertPDFChange}
      />

      <div className="mb-4">
        <FileUploader
          accept="application/pdf"
          multiple={true}
          onFilesSelected={async (files) => {
            if (files.length > 0) {
              await loadPDFs(files);
            }
          }}
          disabled={isLoading || isProcessing || isRendering}
        />
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 p-3 bg-input rounded-md mb-4">
          <Spinner size="sm" />
          <span className="text-sm text-muted-foreground">
            {loadingMessage || "Loading PDFs..."}
          </span>
        </div>
      )}

      <ProcessMessages success={success} error={error} />

      {showPages && (
        <div className="mb-6">
          <MultiToolToolbar
            selectedCount={selectedPages.size}
            canUndo={canUndo}
            canRedo={canRedo}
            isProcessing={isProcessing}
            isRendering={isRendering}
            onBulkRotateLeft={() => bulkRotate(-90)}
            onBulkRotateRight={() => bulkRotate(90)}
            onBulkDelete={bulkDelete}
            onBulkDuplicate={bulkDuplicate}
            onBulkSplit={bulkSplit}
            onSelectAll={selectAll}
            onDeselectAll={deselectAll}
            onDownloadSelected={downloadSelected}
            onUndo={undo}
            onRedo={redo}
            onReset={reset}
            onDownloadAll={downloadAll}
            onAddBlankPage={addBlankPage}
          />
        </div>
      )}

      {showPages && (
        <div className="mb-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              Total Pages: <span className="font-semibold">{pages.length}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Drag pages to reorder • Hover to see actions
            </p>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={pageIds} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pages.map((page, index) => (
                  <MultiToolPageCard
                    key={page.id}
                    pageData={page}
                    pageNumber={index + 1}
                    isSelected={selectedPages.has(page.id)}
                    hasSplitMarker={splitMarkers.has(page.id)}
                    onSelect={() => toggleSelectPage(page.id)}
                    onDelete={() => deletePage(page.id)}
                    onDuplicate={() => duplicatePage(page.id)}
                    onRotate={(delta) => rotatePage(page.id, delta)}
                    onInsertPDF={() => handleInsertPDF(page.id)}
                    onToggleSplit={() => toggleSplitMarker(page.id)}
                    canDelete={pages.length > 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      <ProcessLoadingModal
        isProcessing={isProcessing || isRendering}
        loadingMessage={loadingMessage}
      />
    </div>
  );
};
