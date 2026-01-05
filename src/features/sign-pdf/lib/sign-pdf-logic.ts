import type { PDFDocument } from 'pdf-lib';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { PlacedSignature } from '../types';

export const applySignaturesToPDF = async (
  pdfDoc: PDFDocument,
  pdfJsDoc: PDFDocumentProxy,
  placedSignatures: PlacedSignature[],
  scale: number
): Promise<Uint8Array> => {
  const pages = pdfDoc.getPages();

  for (const sig of placedSignatures) {
    const page = pages[sig.pageIndex];
    if (!page) continue;

    const originalPageSize = page.getSize();

    const pngBytes = await fetch(sig.image.src).then((res) =>
      res.arrayBuffer()
    );

    const pngImage = await pdfDoc.embedPng(pngBytes);

    const renderedPage = await pdfJsDoc.getPage(sig.pageIndex + 1);
    const renderedViewport = renderedPage.getViewport({ scale });
    const scaleRatio = originalPageSize.width / renderedViewport.width;

    const pdfX = sig.x * scaleRatio;
    const pdfY =
      originalPageSize.height -
      sig.y * scaleRatio -
      sig.height * scaleRatio;
    const pdfWidth = sig.width * scaleRatio;
    const pdfHeight = sig.height * scaleRatio;

    page.drawImage(pngImage, {
      x: pdfX,
      y: pdfY,
      width: pdfWidth,
      height: pdfHeight,
    });
  }

  return await pdfDoc.save();
};

