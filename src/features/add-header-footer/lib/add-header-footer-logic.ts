import type { PDFDocument } from "pdf-lib";
import { PDFDocument as PDFLibDocument, rgb, StandardFonts } from "pdf-lib";
import { hexToRgb, parsePageRanges } from "@/lib/pdf/file-utils";
import type { HeaderFooterOptions } from "../types";

export const addHeaderFooter = async (
  pdfDoc: PDFDocument,
  options: HeaderFooterOptions
): Promise<PDFDocument> => {
  const newPdf = await PDFLibDocument.create();
  const allPages = pdfDoc.getPages();
  const totalPages = allPages.length;

  const copiedPages = await newPdf.copyPages(
    pdfDoc,
    allPages.map((_, i) => i)
  );
  copiedPages.forEach((page) => newPdf.addPage(page));

  const helveticaFont = await newPdf.embedFont(StandardFonts.Helvetica);
  const margin = 40;

  const indicesToProcess = parsePageRanges(options.pageRange, totalPages);
  if (indicesToProcess.length === 0) {
    throw new Error(
      "Invalid page range specified. Please check your input (e.g., '1-3, 5')."
    );
  }

  const fontColor = hexToRgb(options.fontColor);
  const fontSize = options.fontSize;

  const drawOptions = {
    font: helveticaFont,
    size: fontSize,
    color: rgb(fontColor.r, fontColor.g, fontColor.b),
  };

  const newPdfPages = newPdf.getPages();

  for (const pageIndex of indicesToProcess) {
    const page = newPdfPages[pageIndex];
    const { width, height } = page.getSize();
    const pageNumber = pageIndex + 1;

    const processText = (text: string): string =>
      text
        .replace(/{page}/g, String(pageNumber))
        .replace(/{total}/g, String(totalPages));

    const processedTexts = {
      headerLeft: processText(options.headerLeft),
      headerCenter: processText(options.headerCenter),
      headerRight: processText(options.headerRight),
      footerLeft: processText(options.footerLeft),
      footerCenter: processText(options.footerCenter),
      footerRight: processText(options.footerRight),
    };

    if (processedTexts.headerLeft) {
      page.drawText(processedTexts.headerLeft, {
        ...drawOptions,
        x: margin,
        y: height - margin,
      });
    }

    if (processedTexts.headerCenter) {
      page.drawText(processedTexts.headerCenter, {
        ...drawOptions,
        x:
          width / 2 -
          helveticaFont.widthOfTextAtSize(
            processedTexts.headerCenter,
            fontSize
          ) /
            2,
        y: height - margin,
      });
    }

    if (processedTexts.headerRight) {
      page.drawText(processedTexts.headerRight, {
        ...drawOptions,
        x:
          width -
          margin -
          helveticaFont.widthOfTextAtSize(processedTexts.headerRight, fontSize),
        y: height - margin,
      });
    }

    if (processedTexts.footerLeft) {
      page.drawText(processedTexts.footerLeft, {
        ...drawOptions,
        x: margin,
        y: margin,
      });
    }

    if (processedTexts.footerCenter) {
      page.drawText(processedTexts.footerCenter, {
        ...drawOptions,
        x:
          width / 2 -
          helveticaFont.widthOfTextAtSize(
            processedTexts.footerCenter,
            fontSize
          ) /
            2,
        y: margin,
      });
    }

    if (processedTexts.footerRight) {
      page.drawText(processedTexts.footerRight, {
        ...drawOptions,
        x:
          width -
          margin -
          helveticaFont.widthOfTextAtSize(processedTexts.footerRight, fontSize),
        y: margin,
      });
    }
  }

  return newPdf;
};
