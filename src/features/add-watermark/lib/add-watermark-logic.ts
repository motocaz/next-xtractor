import type { PDFDocument, PDFImage } from "pdf-lib";
import {
  PDFDocument as PDFLibDocument,
  rgb,
  degrees,
  StandardFonts,
} from "pdf-lib";
import { hexToRgb, readFileAsArrayBuffer } from "@/lib/pdf/file-utils";
import type { WatermarkOptions } from "../types";

export const addWatermark = async (
  pdfDoc: PDFDocument,
  options: WatermarkOptions,
): Promise<PDFDocument> => {
  const newPdf = await PDFLibDocument.create();
  const allPages = pdfDoc.getPages();
  const totalPages = allPages.length;

  const copiedPages = await newPdf.copyPages(
    pdfDoc,
    allPages.map((_, i) => i),
  );
  copiedPages.forEach((page) => newPdf.addPage(page));

  const newPdfPages = newPdf.getPages();

  if (options.type === "text") {
    const watermarkFont = await newPdf.embedFont(StandardFonts.Helvetica);
    const textColor = hexToRgb(options.color);

    for (let i = 0; i < totalPages; i++) {
      const page = newPdfPages[i];
      const { width, height } = page.getSize();
      const textWidth = watermarkFont.widthOfTextAtSize(
        options.text,
        options.fontSize,
      );
      const textHeight = options.fontSize;

      const centerX = width / 2;
      const centerY = height / 2;

      const textCenterX = textWidth / 2;
      const textCenterY = textHeight / 2;

      const angleRad = (options.angle * Math.PI) / 180;
      const offsetX =
        textCenterX * Math.cos(angleRad) - textCenterY * Math.sin(angleRad);
      const offsetY =
        textCenterX * Math.sin(angleRad) + textCenterY * Math.cos(angleRad);

      const x = centerX - offsetX;
      const y = centerY - offsetY;

      page.drawText(options.text, {
        x,
        y,
        font: watermarkFont,
        size: options.fontSize,
        color: rgb(textColor.r, textColor.g, textColor.b),
        opacity: options.opacity,
        rotate: degrees(options.angle),
      });
    }
  } else {
    const imageBytes = await readFileAsArrayBuffer(options.imageFile);
    let watermarkImage: PDFImage;

    if (options.imageFile.type === "image/png") {
      watermarkImage = await newPdf.embedPng(imageBytes);
    } else if (
      options.imageFile.type === "image/jpeg" ||
      options.imageFile.type === "image/jpg"
    ) {
      watermarkImage = await newPdf.embedJpg(imageBytes);
    } else {
      throw new Error(
        "Unsupported Image. Please use a PNG or JPG for the watermark.",
      );
    }

    const scale = 0.5;
    const imgWidth = watermarkImage.width * scale;
    const imgHeight = watermarkImage.height * scale;

    for (let i = 0; i < totalPages; i++) {
      const page = newPdfPages[i];
      const { width, height } = page.getSize();

      const centerX = width / 2;
      const centerY = height / 2;

      const imgCenterX = imgWidth / 2;
      const imgCenterY = imgHeight / 2;

      const angleRad = (options.angle * Math.PI) / 180;
      const offsetX =
        imgCenterX * Math.cos(angleRad) - imgCenterY * Math.sin(angleRad);
      const offsetY =
        imgCenterX * Math.sin(angleRad) + imgCenterY * Math.cos(angleRad);

      const x = centerX - offsetX;
      const y = centerY - offsetY;

      page.drawImage(watermarkImage, {
        x,
        y,
        width: imgWidth,
        height: imgHeight,
        opacity: options.opacity,
        rotate: degrees(options.angle),
      });
    }
  }

  return newPdf;
};
