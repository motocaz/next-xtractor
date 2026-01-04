'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PageThumbnailData } from '../types';
import Image from 'next/image';

interface SortablePageThumbnailProps {
  pageData: PageThumbnailData;
  thumbnailUrl?: string;
}

export const SortablePageThumbnail = ({
  pageData,
  thumbnailUrl,
}: SortablePageThumbnailProps) => {
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

  const displayFileName = pageData.fileName.length > 10
    ? `${pageData.fileName.substring(0, 10)}...`
    : pageData.fileName;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative cursor-move flex flex-col items-center gap-1 p-2 border-2 border-border hover:border-primary rounded-lg bg-input transition-colors"
      {...attributes}
      {...listeners}
    >
      <div className="relative w-full">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={`Page ${pageData.pageNumber} from ${pageData.fileName}`}
            className="rounded-md shadow-md max-w-full h-auto"
          />
        ) : (
          <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Loading...</span>
          </div>
        )}
        <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md font-semibold shadow-lg">
          {pageData.pageNumber}
        </div>
      </div>
      <p
        className="text-xs text-muted-foreground truncate w-full text-center"
        title={`${pageData.fileName} (page ${pageData.pageNumber})`}
      >
        {displayFileName} (p{pageData.pageNumber})
      </p>
    </div>
  );
};

