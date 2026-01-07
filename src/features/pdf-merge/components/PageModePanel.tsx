'use client';

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
import { SortablePageThumbnail } from './SortablePageThumbnail';
import type { MergePageThumbnailData } from '../types';

interface PageModePanelProps {
  pageThumbnails: MergePageThumbnailData[];
  thumbnailImages: Map<string, string>;
  isRendering: boolean;
  onReorder: (activeId: string, overId: string) => void;
}

export const PageModePanel = ({
  pageThumbnails,
  thumbnailImages,
  isRendering,
  onReorder,
}: PageModePanelProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      onReorder(active.id as string, over.id as string);
    }
  };

  const pageIds = pageThumbnails.map((page) => page.id);

  if (isRendering) {
    return (
      <div className="p-4 bg-input rounded-lg border border-accent">
        <p className="text-sm text-muted-foreground text-center">
          Rendering page thumbnails... This may take a moment.
        </p>
      </div>
    );
  }

  if (pageThumbnails.length === 0) {
    return (
      <div className="p-4 bg-input rounded-lg border border-accent">
        <p className="text-sm text-muted-foreground text-center">
          Upload PDF files to see page thumbnails. Drag and drop pages to
          reorder them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Page Preview ({pageThumbnails.length} pages)
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          Drag and drop pages to reorder them. The merge will follow this order.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={pageIds} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pageThumbnails.map((pageData) => {
              const pageId = `${pageData.fileId}-${pageData.pageIndex}`;
              const thumbnailUrl = thumbnailImages.get(pageId);

              return (
                <SortablePageThumbnail
                  key={pageData.id}
                  pageData={pageData}
                  thumbnailUrl={thumbnailUrl}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

