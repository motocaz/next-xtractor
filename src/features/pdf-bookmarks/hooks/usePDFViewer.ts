"use client";

import { useState, useCallback, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy, PageViewport } from "pdfjs-dist";
import type { PDFViewerState } from "../types";

if (typeof globalThis.window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
}

export interface UsePDFViewerReturn {
  state: PDFViewerState;
  loadPDF: (arrayBuffer: ArrayBuffer) => Promise<void>;
  renderPage: (
    pageNum: number,
    canvas: HTMLCanvasElement,
    zoom?: number | null,
    destX?: number | null,
    destY?: number | null
  ) => Promise<void>;
  goToPage: (pageNum: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomFit: () => void;
  getViewport: () => PageViewport | null;
  getCurrentPage: () => number;
  getTotalPages: () => number;
}

export const usePDFViewer = (): UsePDFViewerReturn => {
  const [state, setState] = useState<PDFViewerState>({
    currentPage: 1,
    totalPages: 0,
    zoom: 1,
    viewport: null,
    isLoading: false,
  });

  const pdfJsDocRef = useRef<PDFDocumentProxy | null>(null);
  const currentViewportRef = useRef<PageViewport | null>(null);

  const loadPDF = useCallback(async (arrayBuffer: ArrayBuffer) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
      });
      const pdfDoc = await loadingTask.promise;
      pdfJsDocRef.current = pdfDoc;
      setState((prev) => ({
        ...prev,
        totalPages: pdfDoc.numPages,
        currentPage: 1,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error loading PDF:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const renderPage = useCallback(
    async (
      pageNum: number,
      canvas: HTMLCanvasElement,
      zoom: number | null = null,
      destX: number | null = null,
      destY: number | null = null
    ) => {
      if (!pdfJsDocRef.current) return;

      const page = await pdfJsDocRef.current.getPage(pageNum);
      let zoomScale;
      if (zoom !== null && zoom !== 0) {
        zoomScale =
          typeof zoom === "number"
            ? zoom
            : Number.parseFloat(String(zoom)) / 100;
      } else {
        zoomScale = state.zoom;
      }

      const dpr = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: zoomScale });
      currentViewportRef.current = viewport;

      canvas.height = viewport.height * dpr;
      canvas.width = viewport.width * dpr;

      canvas.style.width = viewport.width + "px";
      canvas.style.height = viewport.height + "px";

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.scale(dpr, dpr);

      await page.render({
        canvasContext: ctx,
        viewport: viewport,
        canvas: canvas,
      }).promise;

      // Draw destination marker if coordinates are provided
      if (destX !== null && destY !== null) {
        const canvasX = destX;
        const canvasY = viewport.height - destY; // Flip Y axis

        ctx.save();
        ctx.strokeStyle = "#3b82f6";
        ctx.fillStyle = "#3b82f6";
        ctx.lineWidth = 3;

        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(59, 130, 246, 0.5)";
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, 12, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw crosshair
        ctx.beginPath();
        ctx.moveTo(canvasX - 15, canvasY);
        ctx.lineTo(canvasX + 15, canvasY);
        ctx.moveTo(canvasX, canvasY - 15);
        ctx.lineTo(canvasX, canvasY + 15);
        ctx.stroke();

        // Draw inner circle
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Draw coordinate text background
        const text = `X: ${Math.round(destX)}, Y: ${Math.round(destY)}`;
        ctx.font = "bold 12px monospace";
        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;
        const textHeight = 18;

        ctx.fillStyle = "rgba(59, 130, 246, 0.95)";
        ctx.fillRect(canvasX + 18, canvasY - 25, textWidth + 10, textHeight);

        ctx.fillStyle = "white";
        ctx.fillText(text, canvasX + 23, canvasY - 10);

        ctx.restore();
      }

      setState((prev) => ({
        ...prev,
        currentPage: pageNum,
        viewport: viewport,
        zoom: zoomScale,
      }));
    },
    [state.zoom]
  );

  const goToPage = useCallback((pageNum: number) => {
    if (
      pdfJsDocRef.current &&
      pageNum >= 1 &&
      pageNum <= pdfJsDocRef.current.numPages
    ) {
      setState((prev) => ({ ...prev, currentPage: pageNum }));
    }
  }, []);

  const nextPage = useCallback(() => {
    if (
      pdfJsDocRef.current &&
      state.currentPage < pdfJsDocRef.current.numPages
    ) {
      setState((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }));
    }
  }, [state.currentPage]);

  const prevPage = useCallback(() => {
    if (state.currentPage > 1) {
      setState((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }));
    }
  }, [state.currentPage]);

  const zoomIn = useCallback(() => {
    setState((prev) => ({
      ...prev,
      zoom: Math.min(prev.zoom + 0.05, 2),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setState((prev) => ({
      ...prev,
      zoom: Math.max(prev.zoom - 0.05, 0.25),
    }));
  }, []);

  const zoomFit = useCallback(() => {
    setState((prev) => ({ ...prev, zoom: 1 }));
  }, []);

  const getViewport = useCallback(() => {
    return currentViewportRef.current;
  }, []);

  const getCurrentPage = useCallback(() => {
    return state.currentPage;
  }, [state.currentPage]);

  const getTotalPages = useCallback(() => {
    return state.totalPages;
  }, [state.totalPages]);

  return {
    state,
    loadPDF,
    renderPage,
    goToPage,
    nextPage,
    prevPage,
    zoomIn,
    zoomOut,
    zoomFit,
    getViewport,
    getCurrentPage,
    getTotalPages,
  };
};
