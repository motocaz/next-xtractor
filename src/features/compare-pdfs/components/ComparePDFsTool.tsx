"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useComparePDFs } from "../hooks/useComparePDFs";
import { FileUploader } from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export const ComparePDFsTool = () => {
  const {
    pdfDoc1,
    pdfDoc2,
    pdfFile1,
    pdfFile2,
    isLoading1,
    isLoading2,
    error1,
    error2,
    currentPage,
    viewMode,
    opacity,
    isSyncScroll,
    loadPDF1,
    loadPDF2,
    resetPDF1,
    resetPDF2,
    setViewMode,
    setOpacity,
    setIsSyncScroll,
    nextPage,
    prevPage,
    renderPage,
  } = useComparePDFs();

  const canvas1Ref = useRef<HTMLCanvasElement>(null);
  const canvas2Ref = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panel1Ref = useRef<HTMLDivElement>(null);
  const panel2Ref = useRef<HTMLDivElement>(null);
  const scrollingPanelRef = useRef<HTMLDivElement | null>(null);

  const maxPages = Math.max(pdfDoc1?.numPages || 0, pdfDoc2?.numPages || 0);
  const showViewer = pdfDoc1 !== null && pdfDoc2 !== null;

  useEffect(() => {
    if (!showViewer || !canvas1Ref.current || !canvas2Ref.current) return;

    const renderBothPages = async () => {
      if (!wrapperRef.current || !panel1Ref.current || !panel2Ref.current)
        return;
      if (!canvas1Ref.current || !canvas2Ref.current) return;

      const container1 =
        viewMode === "overlay" ? wrapperRef.current : panel1Ref.current;
      const container2 =
        viewMode === "overlay" ? wrapperRef.current : panel2Ref.current;

      const page1 = Math.min(currentPage, pdfDoc1?.numPages || 1);
      const page2 = Math.min(currentPage, pdfDoc2?.numPages || 1);

      await Promise.all([
        renderPage(pdfDoc1, page1, canvas1Ref.current, container1),
        renderPage(pdfDoc2, page2, canvas2Ref.current, container2),
      ]);
    };

    renderBothPages();
  }, [showViewer, currentPage, pdfDoc1, pdfDoc2, viewMode, renderPage]);

  useEffect(() => {
    if (canvas2Ref.current && viewMode === "overlay") {
      canvas2Ref.current.style.transition = "";
      canvas2Ref.current.style.opacity = String(opacity);
    } else if (canvas2Ref.current && viewMode === "side-by-side") {
      canvas2Ref.current.style.transition = "";
      canvas2Ref.current.style.opacity = "1";
    }
  }, [opacity, viewMode]);

  useEffect(() => {
    if (!isSyncScroll || viewMode !== "side-by-side") return;
    if (!panel1Ref.current || !panel2Ref.current) return;

    const panel1 = panel1Ref.current;
    const panel2 = panel2Ref.current;

    const handlePanel1Scroll = () => {
      if (scrollingPanelRef.current !== panel2) {
        scrollingPanelRef.current = panel1;
        panel2.scrollTop = panel1.scrollTop;
        setTimeout(() => {
          scrollingPanelRef.current = null;
        }, 100);
      }
    };

    const handlePanel2Scroll = () => {
      if (scrollingPanelRef.current !== panel1) {
        scrollingPanelRef.current = panel2;
        panel1.scrollTop = panel2.scrollTop;
        setTimeout(() => {
          scrollingPanelRef.current = null;
        }, 100);
      }
    };

    panel1.addEventListener("scroll", handlePanel1Scroll);
    panel2.addEventListener("scroll", handlePanel2Scroll);

    return () => {
      panel1.removeEventListener("scroll", handlePanel1Scroll);
      panel2.removeEventListener("scroll", handlePanel2Scroll);
    };
  }, [isSyncScroll, viewMode]);

  const handleFlicker = () => {
    if (!canvas2Ref.current || viewMode !== "overlay") return;
    const currentOpacity = Number.parseFloat(
      canvas2Ref.current.style.opacity || String(opacity),
    );
    const newOpacity = currentOpacity === 0 ? opacity : 0;
    canvas2Ref.current.style.transition = "opacity 150ms ease-in-out";
    canvas2Ref.current.style.opacity = String(newOpacity);
  };

  const handleOpacityChange = (value: number[]) => {
    setOpacity(value[0]);
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

      <h2 className="text-2xl font-bold text-foreground mb-4">Compare PDFs</h2>
      <p className="mb-6 text-muted-foreground">
        Upload two files to visually compare them using either an overlay or a
        side-by-side view.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <Label className="mb-2 block">Original PDF</Label>
          <FileUploader
            accept="application/pdf"
            multiple={false}
            onFilesSelected={async (files) => {
              if (files[0]) {
                await loadPDF1(files[0]);
              }
            }}
            disabled={isLoading1 || isLoading2}
            className="h-48"
          />
          {isLoading1 && (
            <div className="flex items-center gap-2 p-2 bg-input rounded-md mt-2">
              <Spinner size="sm" />
              <span className="text-sm text-muted-foreground">
                Loading PDF...
              </span>
            </div>
          )}
          {error1 && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md mt-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span className="text-sm text-destructive">{error1}</span>
            </div>
          )}
          {pdfFile1 && !error1 && (
            <div className="flex items-center justify-between gap-2 p-2 bg-input rounded-md mt-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm text-foreground truncate">
                  {pdfFile1.name}
                </span>
              </div>
              <button
                onClick={resetPDF1}
                className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                aria-label="Remove PDF"
                title="Remove PDF"
                disabled={isLoading1 || isLoading2}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div>
          <Label className="mb-2 block">Revised PDF</Label>
          <FileUploader
            accept="application/pdf"
            multiple={false}
            onFilesSelected={async (files) => {
              if (files[0]) {
                await loadPDF2(files[0]);
              }
            }}
            disabled={isLoading1 || isLoading2}
            className="h-48"
          />
          {isLoading2 && (
            <div className="flex items-center gap-2 p-2 bg-input rounded-md mt-2">
              <Spinner size="sm" />
              <span className="text-sm text-muted-foreground">
                Loading PDF...
              </span>
            </div>
          )}
          {error2 && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md mt-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span className="text-sm text-destructive">{error2}</span>
            </div>
          )}
          {pdfFile2 && !error2 && (
            <div className="flex items-center justify-between gap-2 p-2 bg-input rounded-md mt-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm text-foreground truncate">
                  {pdfFile2.name}
                </span>
              </div>
              <button
                onClick={resetPDF2}
                className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                aria-label="Remove PDF"
                title="Remove PDF"
                disabled={isLoading1 || isLoading2}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {showViewer && (
        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-4 p-3 bg-input rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={prevPage}
                disabled={currentPage <= 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-foreground font-medium min-w-[100px] text-center">
                Page {currentPage} of {maxPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={nextPage}
                disabled={currentPage >= maxPages}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="h-6 w-px bg-border" />

            <div className="bg-background p-1 rounded-md flex gap-1 border border-border">
              <Button
                variant={viewMode === "overlay" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("overlay")}
                className={cn(
                  viewMode === "overlay" &&
                    "bg-primary text-primary-foreground",
                )}
              >
                Overlay
              </Button>
              <Button
                variant={viewMode === "side-by-side" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("side-by-side")}
                className={cn(
                  viewMode === "side-by-side" &&
                    "bg-primary text-primary-foreground",
                )}
              >
                Side-by-Side
              </Button>
            </div>

            <div className="h-6 w-px bg-border" />

            {viewMode === "overlay" && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFlicker}
                  aria-label="Flicker"
                >
                  Flicker
                </Button>
                <Label htmlFor="opacity-slider" className="text-sm font-medium">
                  Opacity:
                </Label>
                <div className="w-24">
                  <Slider
                    id="opacity-slider"
                    min={0}
                    max={1}
                    step={0.05}
                    value={[opacity]}
                    onValueChange={handleOpacityChange}
                  />
                </div>
              </div>
            )}

            {viewMode === "side-by-side" && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="sync-scroll-toggle"
                  checked={isSyncScroll}
                  onCheckedChange={(checked) =>
                    setIsSyncScroll(checked === true)
                  }
                />
                <Label
                  htmlFor="sync-scroll-toggle"
                  className="text-sm font-medium cursor-pointer"
                >
                  Sync Scrolling
                </Label>
              </div>
            )}
          </div>

          <div
            ref={wrapperRef}
            className={cn(
              "border-2 border-border rounded-lg bg-background",
              viewMode === "overlay"
                ? "relative w-full h-[75vh] overflow-auto"
                : "flex gap-4 w-full",
            )}
          >
            <div
              ref={panel1Ref}
              className={cn(
                viewMode === "overlay"
                  ? "absolute top-0 left-0 w-full"
                  : "flex-1 min-w-0 overflow-auto h-[75vh] border-2 border-border rounded-lg",
              )}
            >
              <canvas
                ref={canvas1Ref}
                className={cn(
                  viewMode === "overlay"
                    ? "absolute top-0 left-0 w-full h-auto"
                    : "w-full h-auto",
                )}
              />
            </div>
            <div
              ref={panel2Ref}
              className={cn(
                viewMode === "overlay"
                  ? "absolute top-0 left-0 w-full"
                  : "flex-1 min-w-0 overflow-auto h-[75vh] border-2 border-border rounded-lg",
              )}
            >
              <canvas
                ref={canvas2Ref}
                className={cn(
                  viewMode === "overlay"
                    ? "absolute top-0 left-0 w-full h-auto"
                    : "w-full h-auto",
                )}
                style={{
                  opacity: viewMode === "overlay" ? opacity : 1,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
