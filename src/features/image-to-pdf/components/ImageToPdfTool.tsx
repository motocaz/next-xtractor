'use client';

import Link from 'next/link';
import { useImageToPdf } from '../hooks/useImageToPdf';
import { FileUploader } from '@/components/FileUploader';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { CheckCircle2, ArrowLeft, X, GripVertical } from 'lucide-react';
import { formatBytes } from '@/lib/pdf/file-utils';
import { FileUploadStatusMessages } from '@/components/common/FileUploadStatusMessages';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';
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
import type { ImageFileInfo } from '../types';
import { useMemo } from 'react';

interface SortableImageItemProps {
  imageInfo: ImageFileInfo;
  onRemove: (id: string) => void;
}

const SortableImageItem = ({ imageInfo, onRemove }: SortableImageItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: imageInfo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="bg-input border-border">
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
                {imageInfo.fileName}
              </span>
            </div>
            <div className="flex items-center gap-2 ml-6">
              <span className="text-xs text-muted-foreground">
                {formatBytes(imageInfo.fileSize)}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {imageInfo.type || 'Unknown type'}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onRemove(imageInfo.id)}
          className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
          aria-label={`Remove ${imageInfo.fileName}`}
          title="Remove image file"
          disabled={false}
        >
          <X className="h-4 w-4" />
        </button>
      </CardContent>
    </Card>
  );
};

export const ImageToPdfTool = () => {
  const {
    imageFiles,
    isLoading,
    isProcessing,
    loadingMessage,
    error,
    success,
    failedFiles,
    quality,
    loadImageFiles,
    removeImageFile,
    reorderFiles,
    setQuality,
    processImageToPdf,
  } = useImageToPdf();

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

  const hasMixedTypes = useMemo(() => {
    if (imageFiles.length <= 1) return false;
    const uniqueTypes = new Set(imageFiles.map((f) => f.type));
    return uniqueTypes.size > 1;
  }, [imageFiles]);

  const fileIds = imageFiles.map((file) => file.id);
  const canProcess = imageFiles.length > 0 && !isProcessing && !isLoading;

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
        Image to PDF
      </h2>
      <p className="mb-6 text-muted-foreground">
        Convert JPG, PNG, WebP, SVG, BMP, HEIC, and TIFF images to PDF. Support
        for single or mixed image types with quality control.
      </p>

      <div className="mb-4">
        <FileUploader
          accept="image/jpeg,image/jpg,image/png,image/webp,image/bmp,image/tiff,image/tif,image/svg+xml,.heic,.heif"
          multiple={true}
          onFilesSelected={async (files) => {
            if (files.length > 0) {
              await loadImageFiles(files);
            }
          }}
          disabled={isLoading || isProcessing}
        />
      </div>

      <FileUploadStatusMessages
        isLoading={isLoading}
        loadingMessage={loadingMessage}
        defaultLoadingText="Loading image files..."
        error={error}
        success={success}
        failedFiles={failedFiles}
      />

      {imageFiles.length > 0 && hasMixedTypes && (
        <div className="mb-4 p-4 bg-input rounded-md border border-border">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="jpeg-quality-slider"
              className="text-sm font-medium text-foreground"
            >
              JPEG Quality (for mixed image types)
            </label>
            <span className="text-sm text-muted-foreground">
              {Math.round(quality * 100)}%
            </span>
          </div>
          <Slider
            id="jpeg-quality-slider"
            value={[quality]}
            onValueChange={(values) => setQuality(values[0])}
            min={0.3}
            max={1}
            step={0.1}
            className="w-full"
            disabled={isProcessing}
            aria-label="JPEG Quality for mixed image types"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Adjust quality for mixed image type conversions. Lower values
            reduce file size but may decrease image quality.
          </p>
        </div>
      )}

      {imageFiles.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Image Files ({imageFiles.length})
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Drag and drop to reorder the files. Images will be converted in this
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
                {imageFiles.map((imageInfo) => (
                  <SortableImageItem
                    key={imageInfo.id}
                    imageInfo={imageInfo}
                    onRemove={removeImageFile}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {imageFiles.length > 0 && (
        <ProcessButton
          onClick={processImageToPdf}
          disabled={!canProcess}
          isProcessing={isProcessing}
          loadingMessage={loadingMessage}
        >
          Convert & Download
        </ProcessButton>
      )}

      <ProcessLoadingModal
        isProcessing={isProcessing}
        loadingMessage={loadingMessage}
      />
    </div>
  );
};

