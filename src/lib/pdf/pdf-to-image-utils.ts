"use client";

import JSZip from "jszip";
import { readFileAsArrayBuffer } from "./file-utils";
import { loadPDFWithPDFJSFromBuffer } from "./pdfjs-loader";

type CanvasConverter = (
  canvas: HTMLCanvasElement,
  ...args: number[]
) => Promise<Blob>;

type ImageDataConverter = (imageData: ImageData) => ArrayBuffer;

type Converter = CanvasConverter | ImageDataConverter;

export interface PdfToImageZipOptions {
  scale: number;
  fileExtension: string;
  converter: Converter;
  converterType: "canvas" | "imagedata";
  converterOptions?: number;
  onProgress?: (currentPage: number, totalPages: number) => void;
}

export const pdfToImageZip = async (
  pdfFile: File,
  options: PdfToImageZipOptions,
): Promise<Blob> => {
  const {
    scale,
    fileExtension,
    converter,
    converterType,
    converterOptions,
    onProgress,
  } = options;

  const arrayBuffer = await readFileAsArrayBuffer(pdfFile);
  const pdfJsDoc = await loadPDFWithPDFJSFromBuffer(arrayBuffer);
  const zip = new JSZip();

  for (let i = 1; i <= pdfJsDoc.numPages; i++) {
    onProgress?.(i, pdfJsDoc.numPages);

    const page = await pdfJsDoc.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to get canvas context");
    }

    await page.render({
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    }).promise;

    let fileData: Blob;

    if (converterType === "imagedata") {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const arrayBuffer = (converter as ImageDataConverter)(imageData);
      fileData = new Blob([arrayBuffer], { type: `image/${fileExtension}` });
    } else {
      fileData = await (converter as CanvasConverter)(
        canvas,
        ...(converterOptions !== undefined ? [converterOptions] : []),
      );
    }

    zip.file(`page_${i}.${fileExtension}`, fileData);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  return zipBlob;
};
