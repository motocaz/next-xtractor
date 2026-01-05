'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { loadPDFWithPDFJSFromBuffer } from '@/lib/pdf/pdfjs-loader';
import { renderPageAsImage } from '@/lib/pdf/canvas-utils';
import { readFileAsArrayBuffer } from '@/lib/pdf/file-utils';

export interface VisualPageSelectorProps {
  pdfFile: File;
  selectedPages: Set<number>;
  onSelectionChange: (pages: Set<number>) => void;
  disabled?: boolean;
  onProgress?: (current: number, total: number) => void;
}

export const VisualPageSelector = ({
  pdfFile,
  selectedPages,
  onSelectionChange,
  disabled = false,
  onProgress,
}: VisualPageSelectorProps) => {
  const [thumbnails, setThumbnails] = useState<Map<number, string>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadThumbnails = useCallback(async () => {
    if (!pdfFile) return;

    setIsLoading(true);
    setError(null);
    setThumbnails(new Map());

    try {
      const arrayBuffer = await readFileAsArrayBuffer(pdfFile);
      const pdfJsDoc = await loadPDFWithPDFJSFromBuffer(arrayBuffer);
      const totalPages = pdfJsDoc.numPages;

      const newThumbnails = new Map<number, string>();

      for (let i = 1; i <= totalPages; i++) {
        onProgress?.(i, totalPages);
        const imageUrl = await renderPageAsImage(pdfJsDoc, i, 0.4);
        newThumbnails.set(i - 1, imageUrl);

        if (i % 5 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      setThumbnails(newThumbnails);
    } catch (err) {
      console.error('Error loading thumbnails:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load page previews. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [pdfFile, onProgress]);

  useEffect(() => {
    if (pdfFile) {
      loadThumbnails();
    }
  }, [pdfFile, loadThumbnails]);

  const handlePageClick = useCallback(
    (pageIndex: number) => {
      if (disabled) return;

      const newSelection = new Set(selectedPages);
      if (newSelection.has(pageIndex)) {
        newSelection.delete(pageIndex);
      } else {
        newSelection.add(pageIndex);
      }
      onSelectionChange(newSelection);
    },
    [selectedPages, onSelectionChange, disabled]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Rendering page previews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (thumbnails.size === 0) {
    return null;
  }

  const totalPages = thumbnails.size;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Click on pages to select them. Selected: {selectedPages.size} of {totalPages}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {Array.from({ length: totalPages }, (_, i) => {
          const pageIndex = i;
          const thumbnailUrl = thumbnails.get(pageIndex);
          const isSelected = selectedPages.has(pageIndex);

          return (
            <div
              key={pageIndex}
              onClick={() => handlePageClick(pageIndex)}
              className={`relative p-1 border-2 rounded-lg cursor-pointer transition-colors ${
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-transparent hover:border-primary/50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-label={`Page ${pageIndex + 1}${isSelected ? ' (selected)' : ''}`}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
                  e.preventDefault();
                  handlePageClick(pageIndex);
                }
              }}
            >
              {thumbnailUrl ? (
                <div className="relative w-full aspect-3/4 rounded-md overflow-hidden bg-background">
                  <Image
                    src={thumbnailUrl}
                    alt={`Page ${pageIndex + 1}`}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-full aspect-3/4 rounded-md bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">Loading...</span>
                </div>
              )}
              <p className="text-center text-xs mt-1 text-muted-foreground">
                Page {pageIndex + 1}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

