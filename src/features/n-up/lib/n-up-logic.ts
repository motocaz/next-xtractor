import { PDFDocument as PDFLibDocument, rgb, PageSizes } from "pdf-lib";
import type { PDFDocument } from "pdf-lib";
import { hexToRgb } from "@/lib/pdf/file-utils";
import type { NUpOptions, GridDimensions } from "../types";

const GRID_DIMENSIONS: Record<number, GridDimensions> = {
  2: [2, 1],
  4: [2, 2],
  9: [3, 3],
  16: [4, 4],
};

export const createNUpPDF = async (
  pdfDoc: PDFDocument,
  options: NUpOptions,
): Promise<PDFDocument> => {
  const newDoc = await PDFLibDocument.create();
  const sourcePages = pdfDoc.getPages();
  const {
    pagesPerSheet,
    pageSize,
    orientation,
    useMargins,
    addBorder,
    borderColor,
  } = options;

  const gridDims = GRID_DIMENSIONS[pagesPerSheet];
  if (!gridDims) {
    throw new Error(`Invalid pages per sheet: ${pagesPerSheet}`);
  }

  let [pageWidth, pageHeight] = PageSizes[pageSize];

  let finalOrientation = orientation;
  if (orientation === "auto") {
    const firstPage = sourcePages[0];
    const isSourceLandscape = firstPage.getWidth() > firstPage.getHeight();
    finalOrientation =
      isSourceLandscape && gridDims[0] > gridDims[1] ? "landscape" : "portrait";
  }

  if (finalOrientation === "landscape" && pageWidth < pageHeight) {
    [pageWidth, pageHeight] = [pageHeight, pageWidth];
  }

  const margin = useMargins ? 36 : 0;
  const gutter = useMargins ? 10 : 0;

  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;

  const borderColorRgb = hexToRgb(borderColor);

  for (let i = 0; i < sourcePages.length; i += pagesPerSheet) {
    const chunk = sourcePages.slice(i, i + pagesPerSheet);
    const outputPage = newDoc.addPage([pageWidth, pageHeight]);

    const cellWidth = (usableWidth - gutter * (gridDims[0] - 1)) / gridDims[0];
    const cellHeight =
      (usableHeight - gutter * (gridDims[1] - 1)) / gridDims[1];

    for (let j = 0; j < chunk.length; j++) {
      const sourcePage = chunk[j];
      const embeddedPage = await newDoc.embedPage(sourcePage);

      const scale = Math.min(
        cellWidth / embeddedPage.width,
        cellHeight / embeddedPage.height,
      );
      const scaledWidth = embeddedPage.width * scale;
      const scaledHeight = embeddedPage.height * scale;

      const row = Math.floor(j / gridDims[0]);
      const col = j % gridDims[0];
      const cellX = margin + col * (cellWidth + gutter);
      const cellY = pageHeight - margin - (row + 1) * cellHeight - row * gutter;

      const x = cellX + (cellWidth - scaledWidth) / 2;
      const y = cellY + (cellHeight - scaledHeight) / 2;

      outputPage.drawPage(embeddedPage, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      });

      if (addBorder) {
        outputPage.drawRectangle({
          x,
          y,
          width: scaledWidth,
          height: scaledHeight,
          borderColor: rgb(
            borderColorRgb.r,
            borderColorRgb.g,
            borderColorRgb.b,
          ),
          borderWidth: 1,
        });
      }
    }
  }

  return newDoc;
};
