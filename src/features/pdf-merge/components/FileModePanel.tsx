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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableFileItem } from './SortableFileItem';
import type { PDFFileInfo } from '@/hooks/useMultiPDFLoader';

interface FileModePanelProps {
  pdfFiles: PDFFileInfo[];
  pageRanges: Map<string, string>;
  onRemove: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
  onPageRangeChange: (fileId: string, range: string) => void;
}

export const FileModePanel = ({
  pdfFiles,
  pageRanges,
  onRemove,
  onReorder,
  onPageRangeChange,
}: FileModePanelProps) => {
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

  const fileIds = pdfFiles.map((pdf) => pdf.id);

  if (pdfFiles.length === 0) {
    return (
      <div className="p-4 bg-input rounded-lg border border-border">
        <p className="text-sm text-muted-foreground text-center">
          Upload PDF files to get started. Drag and drop to reorder them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          PDF Files ({pdfFiles.length})
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          Drag and drop to reorder the files. Specify page ranges for each file
          (e.g., &quot;1-3, 5&quot; or leave blank for all pages).
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={fileIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {pdfFiles.map((pdfInfo) => (
              <SortableFileItem
                key={pdfInfo.id}
                pdfInfo={pdfInfo}
                pageRange={pageRanges.get(pdfInfo.id) || ''}
                onRemove={onRemove}
                onPageRangeChange={onPageRangeChange}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

