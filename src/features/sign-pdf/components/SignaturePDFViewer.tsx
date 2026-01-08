"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Undo2,
} from "lucide-react";
import type { UseSignPdfReturn } from "../types";

interface SignaturePDFViewerProps {
  hook: UseSignPdfReturn;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const SignaturePDFViewer = ({
  hook,
  containerRef,
}: SignaturePDFViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      hook.setCanvasRef(canvasRef.current);
    }
    return () => {
      hook.setCanvasRef(null);
    };
  }, [hook]);

  useEffect(() => {
    if (!hook.activeSignature && ghostRef.current) {
      ghostRef.current.classList.add("hidden");
    }
  }, [hook.activeSignature]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      hook.handleMouseMove(e, canvas);

      if (hook.activeSignature && ghostRef.current) {
        const rect = canvas.getBoundingClientRect();
        const clientX =
          "touches" in e ? (e.touches[0]?.clientX ?? 0) : e.clientX;
        const clientY =
          "touches" in e ? (e.touches[0]?.clientY ?? 0) : e.clientY;

        const canvasX = clientX - rect.left;
        const canvasY = clientY - rect.top;

        const ghost = ghostRef.current;
        const sigWidth = 600;
        const sigHeight =
          (hook.activeSignature.image.height /
            hook.activeSignature.image.width) *
          sigWidth;

        const ghostX = canvasX - sigWidth / 2;
        const ghostY = canvasY - sigHeight / 2;

        const viewportX = rect.left + ghostX;
        const viewportY = rect.top + ghostY;

        ghost.style.backgroundImage = `url('${hook.activeSignature.image.src}')`;
        ghost.style.width = `${sigWidth}px`;
        ghost.style.height = `${sigHeight}px`;
        ghost.style.left = `${viewportX}px`;
        ghost.style.top = `${viewportY}px`;
        ghost.classList.remove("hidden");
      }
    };

    const handleMouseLeave = () => {
      if (ghostRef.current) {
        ghostRef.current.classList.add("hidden");
      }
    };

    const handleDragStart = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      hook.handleDragStart(e, canvas);
    };

    const handleDragMove = (e: MouseEvent | TouchEvent) => {
      hook.handleDragMove(e, canvas);
    };

    const handleDragEnd = () => {
      hook.handleDragEnd();
    };

    const mouseMoveHandler = handleMouseMove as EventListener;
    const touchMoveHandler = handleMouseMove as EventListener;
    const mouseLeaveHandler = handleMouseLeave as EventListener;
    const dragStartHandler = handleDragStart as EventListener;
    const touchStartHandler = handleDragStart as EventListener;
    const dragMoveHandler = handleDragMove as EventListener;
    const touchMoveDragHandler = handleDragMove as EventListener;
    const dragEndHandler = handleDragEnd as EventListener;
    const touchEndHandler = handleDragEnd as EventListener;

    canvas.addEventListener("mousemove", mouseMoveHandler);
    canvas.addEventListener("touchmove", touchMoveHandler, { passive: false });
    canvas.addEventListener("mouseleave", mouseLeaveHandler);
    canvas.addEventListener("mousedown", dragStartHandler);
    canvas.addEventListener("touchstart", touchStartHandler, {
      passive: false,
    });
    document.addEventListener("mousemove", dragMoveHandler);
    document.addEventListener("touchmove", touchMoveDragHandler, {
      passive: false,
    });
    document.addEventListener("mouseup", dragEndHandler);
    document.addEventListener("touchend", touchEndHandler);

    const container = containerRef?.current;
    if (container) {
      container.addEventListener("mouseleave", mouseLeaveHandler);
    }

    return () => {
      canvas.removeEventListener("mousemove", mouseMoveHandler);
      canvas.removeEventListener("touchmove", touchMoveHandler);
      canvas.removeEventListener("mouseleave", mouseLeaveHandler);
      canvas.removeEventListener("mousedown", dragStartHandler);
      canvas.removeEventListener("touchstart", touchStartHandler);
      document.removeEventListener("mousemove", dragMoveHandler);
      document.removeEventListener("touchmove", touchMoveDragHandler);
      document.removeEventListener("mouseup", dragEndHandler);
      document.removeEventListener("touchend", touchEndHandler);
      if (container) {
        container.removeEventListener("mouseleave", mouseLeaveHandler);
      }
    };
  }, [hook, containerRef]);

  const handlePrevPage = () => {
    if (hook.currentPage > 1) {
      hook.setCurrentPage(hook.currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hook.currentPage < hook.totalPages) {
      hook.setCurrentPage(hook.currentPage + 1);
    }
  };

  const getCursorClass = () => {
    if (hook.interactionMode === "drag") return "cursor-move";
    if (hook.interactionMode === "resize") {
      if (
        hook.resizeHandle?.includes("left") &&
        hook.resizeHandle?.includes("top")
      )
        return "cursor-nwse-resize";
      if (
        hook.resizeHandle?.includes("right") &&
        hook.resizeHandle?.includes("top")
      )
        return "cursor-nesw-resize";
      if (
        hook.resizeHandle?.includes("left") &&
        hook.resizeHandle?.includes("bottom")
      )
        return "cursor-nesw-resize";
      if (
        hook.resizeHandle?.includes("right") &&
        hook.resizeHandle?.includes("bottom")
      )
        return "cursor-nwse-resize";
      if (
        hook.resizeHandle?.includes("top") ||
        hook.resizeHandle?.includes("bottom")
      )
        return "cursor-ns-resize";
      if (
        hook.resizeHandle?.includes("left") ||
        hook.resizeHandle?.includes("right")
      )
        return "cursor-ew-resize";
    }
    if (hook.activeSignature) return "cursor-crosshair";
    if (hook.hoveredSigId) return "cursor-move";
    return "";
  };

  if (!hook.pdfJsDoc) {
    return null;
  }

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4 p-3 bg-input rounded-lg border border-border">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevPage}
          disabled={hook.currentPage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-foreground font-medium whitespace-nowrap">
          Page {hook.currentPage} of {hook.totalPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextPage}
          disabled={hook.currentPage >= hook.totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-border" />
        <Button
          variant="outline"
          size="icon"
          onClick={hook.zoomOut}
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={hook.fitToWidth}
          aria-label="Fit to width"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={hook.zoomIn}
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-border" />
        <Button
          variant="outline"
          size="icon"
          onClick={hook.removeLastSignature}
          disabled={hook.isRendering || hook.placedSignatures.length === 0}
          aria-label="Undo last placement"
          title="Undo Last Placement"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={containerRef}
        className={`relative w-full overflow-auto bg-background rounded-lg border border-border min-h-[400px] flex items-center justify-center ${getCursorClass()}`}
      >
        <canvas ref={canvasRef} className="max-w-full h-auto block" />
        <div
          ref={ghostRef}
          className="hidden fixed pointer-events-none z-50 opacity-80"
          style={{
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        />
      </div>
    </div>
  );
};
