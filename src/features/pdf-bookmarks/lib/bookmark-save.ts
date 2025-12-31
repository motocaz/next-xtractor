import {
  PDFDocument,
  PDFName,
  PDFString,
  PDFNumber,
} from 'pdf-lib';
import type { PDFRef, PDFDict } from 'pdf-lib';
import type { BookmarkNode } from '../types';
import { downloadFile } from '@/lib/pdf/file-utils';

export const savePDFWithBookmarks = async (
  pdfDoc: PDFDocument,
  bookmarkTree: BookmarkNode[],
  originalFileName: string
): Promise<void> => {
  const pages = pdfDoc.getPages();
  const outlinesDict = pdfDoc.context.obj({});
  const outlinesRef = pdfDoc.context.register(outlinesDict);

  const createOutlineItems = (
    nodes: BookmarkNode[],
    parentRef: PDFRef
  ): Array<{ ref: PDFRef; dict: PDFDict }> => {
    const items: Array<{ ref: PDFRef; dict: PDFDict }> = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const itemDict = pdfDoc.context.obj({});
      const itemRef = pdfDoc.context.register(itemDict);

      itemDict.set(PDFName.of('Title'), PDFString.of(node.title));
      itemDict.set(PDFName.of('Parent'), parentRef);

      const pageIndex = Math.max(
        0,
        Math.min(node.page - 1, pages.length - 1)
      );
      const pageRef = pages[pageIndex].ref;

      let destArray;
      if (node.destX !== null || node.destY !== null || node.zoom !== null) {
        const x = node.destX !== null ? PDFNumber.of(node.destX) : null;
        const y = node.destY !== null ? PDFNumber.of(node.destY) : null;

        let zoom = null;
        if (node.zoom !== null && node.zoom !== '' && node.zoom !== '0') {
          zoom = PDFNumber.of(Number.parseFloat(node.zoom) / 100);
        }

        destArray = pdfDoc.context.obj([
          pageRef,
          PDFName.of('XYZ'),
          x,
          y,
          zoom,
        ]);
      } else {
        destArray = pdfDoc.context.obj([
          pageRef,
          PDFName.of('XYZ'),
          null,
          null,
          null,
        ]);
      }

      itemDict.set(PDFName.of('Dest'), destArray);

      if (node.color) {
        let rgb: number[];

        if (node.color.startsWith('#')) {
          const hex = node.color.replace('#', '');
          const r = Number.parseInt(hex.substring(0, 2), 16) / 255;
          const g = Number.parseInt(hex.substring(2, 4), 16) / 255;
          const b = Number.parseInt(hex.substring(4, 6), 16) / 255;
          rgb = [r, g, b];
        } else {
          const colorMap: Record<string, number[]> = {
            red: [1, 0, 0],
            blue: [0, 0, 1],
            green: [0, 1, 0],
            yellow: [1, 1, 0],
            purple: [0.5, 0, 0.5],
          };
          rgb = colorMap[node.color];
        }

        if (rgb) {
          const colorArray = pdfDoc.context.obj(rgb);
          itemDict.set(PDFName.of('C'), colorArray);
        }
      }

      if (node.style) {
        let flags = 0;
        if (node.style === 'italic') flags = 1;
        else if (node.style === 'bold') flags = 2;
        else if (node.style === 'bold-italic') flags = 3;

        if (flags > 0) {
          itemDict.set(PDFName.of('F'), PDFNumber.of(flags));
        }
      }

      if (node.children.length > 0) {
        const childItems = createOutlineItems(node.children, itemRef);
        if (childItems.length > 0) {
          itemDict.set(PDFName.of('First'), childItems[0].ref);
          itemDict.set(
            PDFName.of('Last'),
            childItems[childItems.length - 1].ref
          );
          itemDict.set(
            PDFName.of('Count'),
            pdfDoc.context.obj(childItems.length)
          );
        }
      }

      if (i > 0) {
        itemDict.set(PDFName.of('Prev'), items[i - 1].ref);
        items[i - 1].dict.set(PDFName.of('Next'), itemRef);
      }

      items.push({ ref: itemRef, dict: itemDict });
    }

    return items;
  };

  try {
    const topLevelItems = createOutlineItems(bookmarkTree, outlinesRef);

    if (topLevelItems.length > 0) {
      outlinesDict.set(PDFName.of('Type'), PDFName.of('Outlines'));
      outlinesDict.set(PDFName.of('First'), topLevelItems[0].ref);
      outlinesDict.set(
        PDFName.of('Last'),
        topLevelItems[topLevelItems.length - 1].ref
      );
      outlinesDict.set(
        PDFName.of('Count'),
        pdfDoc.context.obj(topLevelItems.length)
      );
    }

    pdfDoc.catalog.set(PDFName.of('Outlines'), outlinesRef);

    const pdfBytes = await pdfDoc.save();
    const arrayBuffer = pdfBytes.buffer.slice(
      pdfBytes.byteOffset,
      pdfBytes.byteOffset + pdfBytes.byteLength
    ) as ArrayBuffer;
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const now = new Date().toISOString();
    downloadFile(blob, originalFileName, `${now}_${originalFileName}.pdf`);
  } catch (err) {
    console.error('Error saving PDF:', err);
    throw new Error('Error saving PDF. Check console for details.');
  }
};

