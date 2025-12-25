'use client';

import Link from 'next/link';
import { useAlternateMerge } from '../hooks/useAlternateMerge';
import { FileUploader } from '@/components/FileUploader';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';
import {
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  X,
  GripVertical,
} from 'lucide-react';
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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PDFFileInfo } from '../types';

interface SortablePDFItemProps {
  pdfInfo: PDFFileInfo;
  onRemove: (id: string) => void;
}

const SortablePDFItem = ({ pdfInfo, onRemove }: SortablePDFItemProps) => {
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

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="bg-input border-border"
    >
      <CardContent className="p-3 flex items-center justify-between gap-2">
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
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate font-medium text-foreground text-sm">
                {pdfInfo.fileName}
              </span>
            </div>
            <span className="text-xs text-muted-foreground ml-6">
              {pdfInfo.pageCount} {pdfInfo.pageCount === 1 ? 'page' : 'pages'}
            </span>
          </div>
        </div>
        <button
          onClick={() => onRemove(pdfInfo.id)}
          className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
          aria-label={`Remove ${pdfInfo.fileName}`}
          title="Remove PDF"
        >
          <X className="h-4 w-4" />
        </button>
      </CardContent>
    </Card>
  );
};

export const AlternateMergeTool = () => {
  const {
    pdfFiles,
    isLoading,
    isProcessing,
    loadingMessage,
    error,
    success,
    loadPDFs,
    removePDF,
    reorderFiles,
    processAlternateMerge,
  } = useAlternateMerge();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      reorderFiles(active.id as string, over.id as string);
    }
  };

  const fileIds = pdfFiles.map((pdf) => pdf.id);
  const canProcess = pdfFiles.length >= 2 && !isProcessing && !isLoading;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <Link
        href="/#tools-header"
        className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 font-semibold transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Tools</span>
      </Link>

      <h2 className="text-2xl font-bold text-foreground mb-4">
        Alternate Merge
      </h2>
      <p className="mb-6 text-muted-foreground">
        Upload multiple PDF files and alternate their pages. Pages will be
        mixed in the order you arrange the files below.
      </p>

      <div className="mb-4">
        <FileUploader
          accept="application/pdf"
          multiple={true}
          onFilesSelected={async (files) => {
            if (files.length > 0) {
              await loadPDFs(files);
            }
          }}
          disabled={isLoading || isProcessing}
        />
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 p-3 bg-input rounded-md mb-4">
          <Spinner size="sm" />
          <span className="text-sm text-muted-foreground">
            {loadingMessage || 'Loading PDFs...'}
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md mb-4">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <span className="text-sm text-destructive whitespace-pre-line">
            {error}
          </span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-md mb-4">
          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
          <span className="text-sm text-foreground">{success}</span>
        </div>
      )}

      {pdfFiles.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            PDF Files ({pdfFiles.length})
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Drag and drop to reorder the files. Pages will be alternated in this
            order.
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fileIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {pdfFiles.map((pdfInfo) => (
                  <SortablePDFItem
                    key={pdfInfo.id}
                    pdfInfo={pdfInfo}
                    onRemove={removePDF}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {pdfFiles.length > 0 && (
        <Button
          variant="gradient"
          className="w-full"
          onClick={processAlternateMerge}
          disabled={!canProcess}
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" />
              {loadingMessage || 'Processing...'}
            </span>
          ) : (
            'Process & Download'
          )}
        </Button>
      )}

      {isProcessing && loadingMessage && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-foreground">{loadingMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

