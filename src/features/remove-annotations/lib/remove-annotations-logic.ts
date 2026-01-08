"use client";

import type { PDFDocument, PDFDict } from "pdf-lib";
import { PDFName } from "pdf-lib";

export const removeAnnotationsFromDoc = (
  pdfDoc: PDFDocument,
  pageIndices: number[] | null = null,
  annotationTypes: Set<string> | null = null,
): void => {
  const pages = pdfDoc.getPages();
  const targetPages =
    pageIndices || Array.from({ length: pages.length }, (_, i) => i);

  for (const pageIndex of targetPages) {
    const page = pages[pageIndex];
    const annotRefs = page.node.Annots()?.asArray() || [];

    if (annotationTypes) {
      const annotsToKeep: (typeof annotRefs)[number][] = [];

      for (const ref of annotRefs) {
        const annot = pdfDoc.context.lookup(ref);
        if (!annot || !("get" in annot)) {
          continue;
        }

        const annotDict = annot as PDFDict;
        const subtypeObj = annotDict.get(PDFName.of("Subtype"));
        const subtype = subtypeObj?.toString().substring(1);

        if (!subtype || !annotationTypes.has(subtype)) {
          annotsToKeep.push(ref);
        }
      }

      if (annotsToKeep.length > 0) {
        const newAnnotsArray = pdfDoc.context.obj(annotsToKeep);
        page.node.set(PDFName.of("Annots"), newAnnotsArray);
      } else {
        page.node.delete(PDFName.of("Annots"));
      }
    } else {
      if (annotRefs.length > 0) {
        page.node.delete(PDFName.of("Annots"));
      }
    }
  }
};
