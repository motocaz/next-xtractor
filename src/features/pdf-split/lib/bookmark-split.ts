"use client";

import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { extractExistingBookmarks } from "@/features/pdf-bookmarks/lib/bookmark-extract";
import type { BookmarkNode } from "@/features/pdf-bookmarks/types";
import { downloadFile } from "@/lib/pdf/file-utils";

export interface SplitByBookmarksOptions {
  bookmarkLevel: string;
  totalPages: number;
  originalFileName?: string;
}

const collectBookmarkPages = (
  bookmarks: BookmarkNode[],
  targetLevel: string,
  currentLevel: number = 0,
  pages: Set<number> = new Set(),
): Set<number> => {
  for (const bookmark of bookmarks) {
    if (targetLevel === "all" || currentLevel === parseInt(targetLevel)) {
      if (bookmark.page > 1) {
        pages.add(bookmark.page - 1);
      }
    }
    if (bookmark.children.length > 0) {
      collectBookmarkPages(
        bookmark.children,
        targetLevel,
        currentLevel + 1,
        pages,
      );
    }
  }
  return pages;
};

export const splitByBookmarks = async (
  pdfDoc: PDFDocument,
  options: SplitByBookmarksOptions,
): Promise<void> => {
  const { bookmarkLevel, totalPages, originalFileName } = options;

  const bookmarkTree = await extractExistingBookmarks(pdfDoc);

  if (bookmarkTree.length === 0) {
    throw new Error("No bookmarks found in the PDF.");
  }

  const splitPages = collectBookmarkPages(bookmarkTree, bookmarkLevel);
  const sortedSplitPages = Array.from(splitPages).sort((a, b) => a - b);

  if (sortedSplitPages.length === 0) {
    throw new Error("No bookmarks found at the selected level.");
  }

  const zip = new JSZip();

  for (let i = 0; i < sortedSplitPages.length; i++) {
    const startPage = i === 0 ? 0 : sortedSplitPages[i];
    const endPage =
      i < sortedSplitPages.length - 1
        ? sortedSplitPages[i + 1] - 1
        : totalPages - 1;

    const pageIndices = Array.from(
      { length: endPage - startPage + 1 },
      (_, idx) => startPage + idx,
    );

    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));
    const pdfBytes = await newPdf.save();
    zip.file(`split-${i + 1}.pdf`, pdfBytes);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const baseName =
    originalFileName?.replace(/\.pdf$/i, "") || "split-by-bookmarks";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  downloadFile(zipBlob, undefined, `${timestamp}_${baseName}.zip`);
};
