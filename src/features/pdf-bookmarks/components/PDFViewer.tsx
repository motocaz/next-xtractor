"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import type { UsePDFViewerReturn } from "../hooks/usePDFViewer";

interface PDFViewerProps {
  pdfViewer: UsePDFViewerReturn;
  onPageChange?: (page: number) => void;
  onCanvasClick?: (x: number, y: number, page: number) => void;
  isPickingDestination?: boolean;
  destinationMarker?: { x: number; y: number } | null;
}

export const PDFViewer = ({
  pdfViewer,
  onPageChange,
  onCanvasClick,
  isPickingDestination = false,
  destinationMarker = null,
}: PDFViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [coordTooltip, setCoordTooltip] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);

  const {
    state,
    renderPage,
    nextPage,
    prevPage,
    goToPage,
    zoomIn,
    zoomOut,
    zoomFit,
  } = pdfViewer;

  const [gotoPageValue, setGotoPageValue] = useState(String(state.currentPage));

  useEffect(() => {
    if (canvasRef.current && state.totalPages > 0) {
      const destX = destinationMarker?.x ?? null;
      const destY = destinationMarker?.y ?? null;
      const timeoutId = setTimeout(() => {
        renderPage(state.currentPage, canvasRef.current!, null, destX, destY);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [
    state.currentPage,
    state.zoom,
    state.totalPages,
    renderPage,
    destinationMarker,
  ]);

  const handlePageChange = (newPage: number) => {
    goToPage(newPage);
    onPageChange?.(newPage);
  };

  const handleNextPage = () => {
    nextPage();
    onPageChange?.(state.currentPage + 1);
  };

  const handlePrevPage = () => {
    prevPage();
    onPageChange?.(state.currentPage - 1);
  };

  const handleGotoPage = () => {
    const value = inputRef.current?.value || gotoPageValue;
    const page = Number.parseInt(value);
    if (page >= 1 && page <= state.totalPages) {
      handlePageChange(page);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleGotoPage();
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPickingDestination || !onCanvasClick || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    const viewport = pdfViewer.getViewport();
    if (!viewport) return;

    const scaleX = viewport.width / rect.width;
    const scaleY = viewport.height / rect.height;
    const pdfX = canvasX * scaleX;
    const pdfY = viewport.height - canvasY * scaleY;

    onCanvasClick(pdfX, pdfY, state.currentPage);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPickingDestination || !canvasRef.current) {
      setCoordTooltip(null);
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const viewport = pdfViewer.getViewport();
    if (!viewport) return;

    const scaleX = viewport.width / rect.width;
    const scaleY = viewport.height / rect.height;
    const pdfX = x * scaleX;
    const pdfY = viewport.height - y * scaleY;

    setCoordTooltip({
      x: e.clientX,
      y: e.clientY,
      text: `X: ${Math.round(pdfX)}, Y: ${Math.round(pdfY)}`,
    });
  };

  const handleMouseLeave = () => {
    setCoordTooltip(null);
  };

  if (state.totalPages === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-background border border-border rounded-lg">
        <p className="text-muted-foreground">No PDF loaded</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={state.currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-foreground whitespace-nowrap">
            Page {state.currentPage} / {state.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={state.currentPage >= state.totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Go to:</span>
          <Input
            ref={inputRef}
            key={`goto-page-${state.currentPage}`}
            type="number"
            min={1}
            max={state.totalPages}
            defaultValue={String(state.currentPage)}
            onChange={(e) => setGotoPageValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-16 h-8 text-sm"
          />
          <Button variant="outline" size="sm" onClick={handleGotoPage}>
            Go
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={zoomOut}
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-foreground whitespace-nowrap min-w-[60px] text-center">
            {Math.round(state.zoom * 100)}%
          </span>
          <Button variant="outline" size="sm" onClick={zoomIn} title="Zoom In">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={zoomFit}
            title="Fit to Width"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={wrapperRef}
        className={`overflow-auto border border-border rounded relative flex items-center justify-center min-h-[400px] ${
          isPickingDestination ? "cursor-crosshair" : ""
        }`}
      >
        <div className="pdf-canvas-wrapper relative inline-block">
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto block"
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
          {coordTooltip && (
            <div
              className="absolute bg-black/80 text-white px-2 py-1 rounded text-xs font-mono pointer-events-none z-20 whitespace-nowrap"
              style={{
                left: coordTooltip.x + 15,
                top: coordTooltip.y + 15,
              }}
            >
              {coordTooltip.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
