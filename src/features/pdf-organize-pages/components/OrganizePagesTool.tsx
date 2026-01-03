'use client';

import Link from 'next/link';
import { useOrganizePages } from '../hooks/useOrganizePages';
import { PDFUploadSection } from '@/components/common/PDFUploadSection';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessMessages } from '@/components/common/ProcessMessages';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';
import { ArrowLeft } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { PageThumbnail } from './PageThumbnail';

export const OrganizePagesTool = () => {
  const {
    pages,
    thumbnails,
    isLoadingThumbnails,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    loadPDF,
    reorderPages,
    duplicatePage,
    deletePage,
    processAndSave,
    reset,
  } = useOrganizePages();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      reorderPages(active.id as string, over.id as string);
    }
  };

  const pageIds = pages.map((page) => page.id);
  const showThumbnails = pdfDoc !== null && !isLoadingPDF && !pdfError && pages.length > 0;

  const getThumbnailUrl = (originalPageIndex: number): string | undefined => {
    const thumbnail = thumbnails.find((t) => t.pageNum === originalPageIndex + 1);
    return thumbnail?.imageUrl;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <Link
        href="/#tools-header"
        className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 font-semibold transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Tools</span>
      </Link>

      <h2 className="text-2xl font-bold text-foreground mb-4">Organize Pages</h2>
      <p className="mb-6 text-muted-foreground">
        Reorder, duplicate, or delete pages with a simple drag-and-drop interface. Drag pages to
        reorder them, or use the buttons to duplicate or delete pages.
      </p>

      <PDFUploadSection
        pdfFile={pdfFile}
        pdfDoc={pdfDoc}
        isLoadingPDF={isLoadingPDF}
        pdfError={pdfError}
        loadPDF={loadPDF}
        reset={reset}
        disabled={isProcessing}
      />

      {isLoadingThumbnails && (
        <div className="mt-6 p-4 bg-input rounded-lg">
          <p className="text-sm text-muted-foreground">
            {loadingMessage || 'Rendering page thumbnails...'}
          </p>
        </div>
      )}

      {showThumbnails && (
        <div className="mt-6">
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
                {pages.map((page) => (
                  <PageThumbnail
                    key={page.id}
                    pageData={page}
                    thumbnailUrl={getThumbnailUrl(page.originalPageIndex)}
                    onDuplicate={() => duplicatePage(page.id)}
                    onDelete={() => deletePage(page.id)}
                    canDelete={pages.length > 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="mt-6">
            <ProcessButton
              onClick={processAndSave}
              isProcessing={isProcessing}
              loadingMessage={loadingMessage}
            >
              Process & Download
            </ProcessButton>

            <ProcessMessages success={success} error={error} />
          </div>
        </div>
      )}

      <ProcessLoadingModal isProcessing={isProcessing} loadingMessage={loadingMessage} />
    </div>
  );
};

