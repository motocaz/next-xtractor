import { PDFDocument } from 'pdf-lib';
import { parsePageRanges } from '@/lib/pdf/file-utils';
import type { PDFFileInfo } from '@/hooks/useMultiPDFLoader';
import type { MergePageThumbnailData } from '../types';

export const mergePDFsFileMode = async (
  pdfFiles: PDFFileInfo[],
  pageRanges: Map<string, string>
): Promise<PDFDocument> => {
  if (!pdfFiles || pdfFiles.length === 0) {
    throw new Error('At least one PDF file is required for merging.');
  }

  const newPdfDoc = await PDFDocument.create();

  for (const pdfInfo of pdfFiles) {
    const rangeString = pageRanges.get(pdfInfo.id) || '';
    const totalPages = pdfInfo.pdfDoc.getPageCount();
    
    const pageIndices = rangeString.trim()
      ? parsePageRanges(rangeString, totalPages)
      : Array.from({ length: totalPages }, (_, i) => i);

    if (pageIndices.length === 0) {
      continue;
    }

    const copiedPages = await newPdfDoc.copyPages(pdfInfo.pdfDoc, pageIndices);
    copiedPages.forEach((page) => newPdfDoc.addPage(page));
  }

  return newPdfDoc;
};

export const mergePDFsPageMode = async (
  pdfFiles: PDFFileInfo[],
  pageOrder: MergePageThumbnailData[]
): Promise<PDFDocument> => {
  if (!pdfFiles || pdfFiles.length === 0) {
    throw new Error('At least one PDF file is required for merging.');
  }

  if (!pageOrder || pageOrder.length === 0) {
    throw new Error('At least one page must be selected for merging.');
  }

  const newPdfDoc = await PDFDocument.create();
  const pdfFilesMap = new Map<string, PDFFileInfo>();
  
  pdfFiles.forEach((pdf) => {
    pdfFilesMap.set(pdf.id, pdf);
  });

  for (const pageData of pageOrder) {
    const pdfInfo = pdfFilesMap.get(pageData.fileId);
    if (!pdfInfo) {
      console.warn(`PDF file not found for page: ${pageData.id}`);
      continue;
    }

    const pageIndex = pageData.pageIndex;
    if (pageIndex < 0 || pageIndex >= pdfInfo.pdfDoc.getPageCount()) {
      console.warn(`Invalid page index: ${pageIndex} for file: ${pdfInfo.fileName}`);
      continue;
    }

    try {
      const [copiedPage] = await newPdfDoc.copyPages(pdfInfo.pdfDoc, [pageIndex]);
      newPdfDoc.addPage(copiedPage);
    } catch (error) {
      console.error(`Error copying page ${pageIndex} from ${pdfInfo.fileName}:`, error);
      throw new Error(`Failed to copy page ${pageData.pageNumber} from ${pdfInfo.fileName}`);
    }
  }

  return newPdfDoc;
};

