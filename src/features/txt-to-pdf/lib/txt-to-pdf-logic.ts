'use client';

import {
  PDFDocument,
  rgb,
  StandardFonts,
  PageSizes,
} from 'pdf-lib';
import { hexToRgb } from '@/lib/pdf/file-utils';
import type { FontFamily, PageSize } from '../types';

export const sanitizeTextForPdf = (text: string): string => {
  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);

      if (code === 0x20 || code === 0x09 || code === 0x0a) {
        return char;
      }

      if ((code >= 0x00 && code <= 0x1f) || (code >= 0x7f && code <= 0x9f)) {
        return ' ';
      }

      if (code < 0x20 || (code > 0x7e && code < 0xa0)) {
        return ' ';
      }

      const replacements: { [key: number]: string } = {
        0x2018: "'",
        0x2019: "'",
        0x201c: '"',
        0x201d: '"',
        0x2013: '-',
        0x2014: '--',
        0x2026: '...',
        0x00a0: ' ',
      };

      if (replacements[code]) {
        return replacements[code];
      }

      try {
        if (code <= 0xff) {
          return char;
        }
        return '?';
      } catch {
        return '?';
      }
    })
    .join('')
    .replace(/[ \t]+/g, ' ') 
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd()) 
    .join('\n');
};

export const createPdfFromText = async (
  text: string,
  fontFamily: FontFamily,
  fontSize: number,
  pageSize: PageSize,
  colorHex: string
): Promise<Uint8Array> => {
  const sanitizedText = sanitizeTextForPdf(text);

  const pdfDoc = await PDFDocument.create();
  
  let fontKey: keyof typeof StandardFonts;
  switch (fontFamily) {
    case 'Helvetica':
      fontKey = 'Helvetica';
      break;
    case 'TimesRoman':
      fontKey = 'TimesRoman';
      break;
    case 'Courier':
      fontKey = 'Courier';
      break;
  }
  
  const font = await pdfDoc.embedFont(StandardFonts[fontKey]);
  const pageDimensions = PageSizes[pageSize];
  const margin = 72; // 1 inch margin
  const textColor = hexToRgb(colorHex);

  let page = pdfDoc.addPage(pageDimensions);
  const { width, height } = page.getSize();
  const textWidth = width - margin * 2;
  const lineHeight = fontSize * 1.3;
  let y = height - margin;

  const paragraphs = sanitizedText.split('\n');
  for (const paragraph of paragraphs) {
    const words = paragraph.split(' ');
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine.length > 0 ? `${currentLine} ${word}` : word;
      
      if (font.widthOfTextAtSize(testLine, fontSize) <= textWidth) {
        currentLine = testLine;
      } else {
        if (y < margin + lineHeight) {
          page = pdfDoc.addPage(pageDimensions);
          y = page.getHeight() - margin;
        }
        
        page.drawText(currentLine, {
          x: margin,
          y,
          font,
          size: fontSize,
          color: rgb(textColor.r, textColor.g, textColor.b),
        });
        
        y -= lineHeight;
        currentLine = word;
      }
    }
    
    if (currentLine.length > 0) {
      if (y < margin + lineHeight) {
        page = pdfDoc.addPage(pageDimensions);
        y = page.getHeight() - margin;
      }
      
      page.drawText(currentLine, {
        x: margin,
        y,
        font,
        size: fontSize,
        color: rgb(textColor.r, textColor.g, textColor.b),
      });
      
      y -= lineHeight;
    }
    
    y -= lineHeight * 0.3;
  }

  return await pdfDoc.save();
};

