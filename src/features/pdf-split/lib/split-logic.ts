'use client';

import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { parsePageRanges } from '@/lib/pdf/file-utils';
import { downloadFile, saveAndDownloadPDF } from '@/lib/pdf/file-utils';

export interface SplitByRangeOptions {
  pageRange: string;
  totalPages: number;
  downloadAsZip: boolean;
  originalFileName?: string;
}

export interface SplitByVisualSelectionOptions {
  selectedPages: Set<number>;
  downloadAsZip: boolean;
  originalFileName?: string;
}

export interface SplitEvenOddOptions {
  choice: 'even' | 'odd';
  totalPages: number;
  originalFileName?: string;
}

export interface SplitAllPagesOptions {
  totalPages: number;
  originalFileName?: string;
}

export interface SplitByNPagesOptions {
  nValue: number;
  totalPages: number;
  originalFileName?: string;
}

export const splitByRange = async (
  pdfDoc: PDFDocument,
  options: SplitByRangeOptions
): Promise<void> => {
  const { pageRange, totalPages, downloadAsZip, originalFileName } = options;

  if (!pageRange || pageRange.trim() === '') {
    throw new Error('Please enter a page range.');
  }

  const pageIndices = parsePageRanges(pageRange, totalPages);
  const uniqueIndices = [...new Set(pageIndices)].sort((a, b) => a - b);

  if (uniqueIndices.length === 0) {
    throw new Error('No valid pages were selected for splitting.');
  }

  if (downloadAsZip || uniqueIndices.length > 1) {
    const zip = new JSZip();
    for (const index of uniqueIndices) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [index]);
      newPdf.addPage(copiedPage);
      const pdfBytes = await newPdf.save();
      zip.file(`page-${index + 1}.pdf`, pdfBytes);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const baseName = originalFileName?.replace(/\.pdf$/i, '') || 'split-pages';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadFile(zipBlob, undefined, `${timestamp}_${baseName}.zip`);
  } else {
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [uniqueIndices[0]]);
    newPdf.addPage(copiedPage);
    const pdfBytes = await newPdf.save();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = originalFileName
      ? `${timestamp}_${originalFileName}`
      : `${timestamp}_split-document.pdf`;
    saveAndDownloadPDF(pdfBytes, originalFileName, filename);
  }
};

export const splitByVisualSelection = async (
  pdfDoc: PDFDocument,
  options: SplitByVisualSelectionOptions
): Promise<void> => {
  const { selectedPages, downloadAsZip, originalFileName } = options;

  if (selectedPages.size === 0) {
    throw new Error('No pages were selected for splitting.');
  }

  const sortedIndices = Array.from(selectedPages).sort((a, b) => a - b);

  if (downloadAsZip || sortedIndices.length > 1) {
    const zip = new JSZip();
    for (const index of sortedIndices) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [index]);
      newPdf.addPage(copiedPage);
      const pdfBytes = await newPdf.save();
      zip.file(`page-${index + 1}.pdf`, pdfBytes);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const baseName = originalFileName?.replace(/\.pdf$/i, '') || 'split-pages';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadFile(zipBlob, undefined, `${timestamp}_${baseName}.zip`);
  } else {
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [sortedIndices[0]]);
    newPdf.addPage(copiedPage);
    const pdfBytes = await newPdf.save();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = originalFileName
      ? `${timestamp}_${originalFileName}`
      : `${timestamp}_split-document.pdf`;
    saveAndDownloadPDF(pdfBytes, originalFileName, filename);
  }
};

export const splitEvenOdd = async (
  pdfDoc: PDFDocument,
  options: SplitEvenOddOptions
): Promise<void> => {
  const { choice, totalPages, originalFileName } = options;

  const indicesToExtract: number[] = [];
  for (let i = 0; i < totalPages; i++) {
    if (choice === 'even' && (i + 1) % 2 === 0) {
      indicesToExtract.push(i);
    } else if (choice === 'odd' && (i + 1) % 2 !== 0) {
      indicesToExtract.push(i);
    }
  }

  if (indicesToExtract.length === 0) {
    throw new Error(`No ${choice} pages found in the document.`);
  }

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(pdfDoc, indicesToExtract);
  copiedPages.forEach((page) => newPdf.addPage(page));
  const pdfBytes = await newPdf.save();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = originalFileName
    ? `${timestamp}_${originalFileName.replace(/\.pdf$/i, '')}_${choice}.pdf`
    : `${timestamp}_split-${choice}.pdf`;
  saveAndDownloadPDF(pdfBytes, originalFileName, filename);
};

export const splitAllPages = async (
  pdfDoc: PDFDocument,
  options: SplitAllPagesOptions
): Promise<void> => {
  const { totalPages, originalFileName } = options;

  const zip = new JSZip();
  for (let i = 0; i < totalPages; i++) {
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
    newPdf.addPage(copiedPage);
    const pdfBytes = await newPdf.save();
    zip.file(`page-${i + 1}.pdf`, pdfBytes);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const baseName = originalFileName?.replace(/\.pdf$/i, '') || 'split-pages';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  downloadFile(zipBlob, undefined, `${timestamp}_${baseName}.zip`);
};

export const splitByNPages = async (
  pdfDoc: PDFDocument,
  options: SplitByNPagesOptions
): Promise<void> => {
  const { nValue, totalPages, originalFileName } = options;

  if (nValue < 1) {
    throw new Error('N must be at least 1.');
  }

  const zip = new JSZip();
  const numSplits = Math.ceil(totalPages / nValue);

  for (let i = 0; i < numSplits; i++) {
    const startPage = i * nValue;
    const endPage = Math.min(startPage + nValue - 1, totalPages - 1);
    const pageIndices = Array.from(
      { length: endPage - startPage + 1 },
      (_, idx) => startPage + idx
    );

    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));
    const pdfBytes = await newPdf.save();
    zip.file(`split-${i + 1}.pdf`, pdfBytes);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const baseName = originalFileName?.replace(/\.pdf$/i, '') || 'split-n-times';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  downloadFile(zipBlob, undefined, `${timestamp}_${baseName}.zip`);
};

