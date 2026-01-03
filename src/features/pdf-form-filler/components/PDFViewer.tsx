'use client';

import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PDFViewerProps {
  currentPage: number;
  totalPages: number;
  zoom: number;
  isRendering: boolean;
  onPageChange: (offset: number) => void;
  onZoomChange: (factor: number) => void;
  onCanvasRef: (canvas: HTMLCanvasElement | null) => void;
}

export const PDFViewer = ({
  currentPage,
  totalPages,
  zoom,
  isRendering,
  onPageChange,
  onZoomChange,
  onCanvasRef,
}: PDFViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      onCanvasRef(canvasRef.current);
    }
    return () => {
      onCanvasRef(null);
    };
  }, [onCanvasRef]);

  const handleZoomIn = () => {
    onZoomChange(zoom + 0.25);
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(1, zoom - 0.25));
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-4 p-3 bg-input rounded-lg border border-border">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(-1)}
          disabled={currentPage <= 1 || isRendering}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-foreground font-medium whitespace-nowrap">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={currentPage >= totalPages || isRendering}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-border" />
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          disabled={zoom <= 1 || isRendering}
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          disabled={zoom >= 5 || isRendering}
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={containerRef}
        className="relative w-full overflow-auto bg-background rounded-lg border border-border grow min-h-[400px] flex items-center justify-center"
      >
        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <p className="text-sm text-muted-foreground">Rendering...</p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="mx-auto max-w-full h-auto"
          style={{ display: 'block' }}
        />
      </div>
    </div>
  );
};

