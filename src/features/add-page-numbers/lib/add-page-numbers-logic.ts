import type { PDFDocument } from "pdf-lib";
import { PDFDocument as PDFLibDocument, rgb, StandardFonts } from "pdf-lib";
import { hexToRgb } from "@/lib/pdf/file-utils";
import type { PageNumbersOptions } from "../types";

export const addPageNumbers = async (
  pdfDoc: PDFDocument,
  options: PageNumbersOptions,
): Promise<PDFDocument> => {
  const newPdf = await PDFLibDocument.create();
  const allPages = pdfDoc.getPages();
  const totalPages = allPages.length;

  const copiedPages = await newPdf.copyPages(
    pdfDoc,
    allPages.map((_, i) => i),
  );
  copiedPages.forEach((page) => newPdf.addPage(page));

  const helveticaFont = await newPdf.embedFont(StandardFonts.Helvetica);
  const textColor = hexToRgb(options.textColor);
  const fontSize = options.fontSize;

  const newPdfPages = newPdf.getPages();

  for (let i = 0; i < totalPages; i++) {
    const page = newPdfPages[i];

    const mediaBox = page.getMediaBox();
    const cropBox = page.getCropBox();
    const bounds = cropBox || mediaBox;
    const width = bounds.width;
    const height = bounds.height;
    const xOffset = bounds.x || 0;
    const yOffset = bounds.y || 0;

    const pageNumText =
      options.format === "page_x_of_y"
        ? `${i + 1} / ${totalPages}`
        : `${i + 1}`;

    const textWidth = helveticaFont.widthOfTextAtSize(pageNumText, fontSize);
    const textHeight = fontSize;

    const minMargin = 8;
    const maxMargin = 40;
    const marginPercentage = 0.04;

    const horizontalMargin = Math.max(
      minMargin,
      Math.min(maxMargin, width * marginPercentage),
    );
    const verticalMargin = Math.max(
      minMargin,
      Math.min(maxMargin, height * marginPercentage),
    );

    const safeHorizontalMargin = Math.max(horizontalMargin, textWidth / 2 + 3);
    const safeVerticalMargin = Math.max(verticalMargin, textHeight + 3);

    let x, y;

    switch (options.position) {
      case "bottom-center":
        x =
          Math.max(
            safeHorizontalMargin,
            Math.min(
              width - safeHorizontalMargin - textWidth,
              (width - textWidth) / 2,
            ),
          ) + xOffset;
        y = safeVerticalMargin + yOffset;
        break;
      case "bottom-left":
        x = safeHorizontalMargin + xOffset;
        y = safeVerticalMargin + yOffset;
        break;
      case "bottom-right":
        x =
          Math.max(
            safeHorizontalMargin,
            width - safeHorizontalMargin - textWidth,
          ) + xOffset;
        y = safeVerticalMargin + yOffset;
        break;
      case "top-center":
        x =
          Math.max(
            safeHorizontalMargin,
            Math.min(
              width - safeHorizontalMargin - textWidth,
              (width - textWidth) / 2,
            ),
          ) + xOffset;
        y = height - safeVerticalMargin - textHeight + yOffset;
        break;
      case "top-left":
        x = safeHorizontalMargin + xOffset;
        y = height - safeVerticalMargin - textHeight + yOffset;
        break;
      case "top-right":
        x =
          Math.max(
            safeHorizontalMargin,
            width - safeHorizontalMargin - textWidth,
          ) + xOffset;
        y = height - safeVerticalMargin - textHeight + yOffset;
        break;
    }

    x = Math.max(xOffset + 3, Math.min(xOffset + width - textWidth - 3, x));
    y = Math.max(yOffset + 3, Math.min(yOffset + height - textHeight - 3, y));

    page.drawText(pageNumText, {
      x,
      y,
      font: helveticaFont,
      size: fontSize,
      color: rgb(textColor.r, textColor.g, textColor.b),
    });
  }

  return newPdf;
};
