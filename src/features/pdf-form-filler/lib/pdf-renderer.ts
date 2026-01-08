"use client";

import type { PDFDocumentProxy } from "pdfjs-dist";
import { loadPDFWithPDFJSFromBuffer } from "@/lib/pdf/pdfjs-loader";

export const loadPDFForRendering = async (
  pdfBytes: Uint8Array,
): Promise<PDFDocumentProxy> => {
  const arrayBuffer = new ArrayBuffer(pdfBytes.length);
  new Uint8Array(arrayBuffer).set(pdfBytes);
  return await loadPDFWithPDFJSFromBuffer(arrayBuffer);
};

export const renderPDFPage = async (
  pdfJsDoc: PDFDocumentProxy,
  pageNum: number,
  canvas: HTMLCanvasElement,
  scale: number,
): Promise<void> => {
  const page = await pdfJsDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1 });

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  canvas.style.transformOrigin = "top left";
  canvas.style.transform = `scale(${scale})`;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not get canvas context");
  }

  await page.render({
    canvasContext: context,
    viewport: viewport,
    canvas: canvas,
  }).promise;
};
