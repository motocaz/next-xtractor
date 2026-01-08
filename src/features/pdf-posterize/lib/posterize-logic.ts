"use client";

import type { PDFDocumentProxy } from "pdfjs-dist";
import { PDFDocument as PDFLibDocument, PageSizes } from "pdf-lib";
import { parsePageRanges } from "@/lib/pdf/file-utils";
import { canvasToPngBytes } from "@/lib/pdf/canvas-utils";
import type { PosterizeOptions } from "../types";

export const posterizePDF = async (
  pdfJsDoc: PDFDocumentProxy,
  options: PosterizeOptions,
  onProgress?: (currentPage: number, totalPages: number) => void,
): Promise<Uint8Array> => {
  const {
    rows,
    cols,
    pageSize,
    orientation,
    scalingMode,
    overlap,
    overlapUnits,
    pageRange,
  } = options;

  let overlapInPoints = overlap;
  if (overlapUnits === "in") {
    overlapInPoints = overlap * 72;
  } else if (overlapUnits === "mm") {
    overlapInPoints = overlap * (72 / 25.4);
  }

  const newDoc = await PDFLibDocument.create();
  const totalPages = pdfJsDoc.numPages;
  const pageIndicesToProcess = parsePageRanges(pageRange, totalPages);

  if (pageIndicesToProcess.length === 0) {
    throw new Error("Invalid page range specified.");
  }

  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  if (!tempCtx) {
    throw new Error("Failed to get canvas context");
  }

  let processedPages = 0;

  for (const pageIndex of pageIndicesToProcess) {
    const page = await pdfJsDoc.getPage(Number(pageIndex) + 1);
    const viewport = page.getViewport({ scale: 2 });
    tempCanvas.width = viewport.width;
    tempCanvas.height = viewport.height;
    await page.render({ canvasContext: tempCtx, viewport, canvas: tempCanvas })
      .promise;

    let [targetWidth, targetHeight] = PageSizes[pageSize];
    let currentOrientation = orientation;

    if (currentOrientation === "auto") {
      currentOrientation =
        viewport.width > viewport.height ? "landscape" : "portrait";
    }

    if (currentOrientation === "landscape" && targetWidth < targetHeight) {
      [targetWidth, targetHeight] = [targetHeight, targetWidth];
    } else if (
      currentOrientation === "portrait" &&
      targetWidth > targetHeight
    ) {
      [targetWidth, targetHeight] = [targetHeight, targetWidth];
    }

    const tileWidth = tempCanvas.width / cols;
    const tileHeight = tempCanvas.height / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const sx = c * tileWidth - (c > 0 ? overlapInPoints : 0);
        const sy = r * tileHeight - (r > 0 ? overlapInPoints : 0);
        const sWidth =
          tileWidth +
          (c > 0 ? overlapInPoints : 0) +
          (c < cols - 1 ? overlapInPoints : 0);
        const sHeight =
          tileHeight +
          (r > 0 ? overlapInPoints : 0) +
          (r < rows - 1 ? overlapInPoints : 0);

        const tileCanvas = document.createElement("canvas");
        tileCanvas.width = sWidth;
        tileCanvas.height = sHeight;
        const tileCtx = tileCanvas.getContext("2d");
        if (!tileCtx) {
          throw new Error("Failed to get tile canvas context");
        }

        tileCtx.drawImage(
          tempCanvas,
          sx,
          sy,
          sWidth,
          sHeight,
          0,
          0,
          sWidth,
          sHeight,
        );

        const pngBytes = await canvasToPngBytes(tileCanvas);
        const tileImage = await newDoc.embedPng(pngBytes);

        const newPage = newDoc.addPage([targetWidth, targetHeight]);

        const scaleX = newPage.getWidth() / sWidth;
        const scaleY = newPage.getHeight() / sHeight;
        const scale =
          scalingMode === "fit"
            ? Math.min(scaleX, scaleY)
            : Math.max(scaleX, scaleY);

        const scaledWidth = sWidth * scale;
        const scaledHeight = sHeight * scale;

        newPage.drawImage(tileImage, {
          x: (newPage.getWidth() - scaledWidth) / 2,
          y: (newPage.getHeight() - scaledHeight) / 2,
          width: scaledWidth,
          height: scaledHeight,
        });
      }
    }

    processedPages++;
    onProgress?.(processedPages, pageIndicesToProcess.length);
  }

  const pdfBytes = await newDoc.save();
  return pdfBytes;
};
