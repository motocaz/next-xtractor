import type { HOCRWord } from '../types';

export const parseHOCR = (hocrText: string): HOCRWord[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(hocrText, 'text/html');
  const words: HOCRWord[] = [];

  const wordElements = doc.querySelectorAll('.ocrx_word');

  wordElements.forEach((wordEl) => {
    const titleAttr = wordEl.getAttribute('title');
    const text = wordEl.textContent?.trim() || '';

    if (!titleAttr || !text) return;

    const bboxRegex = /bbox (\d+) (\d+) (\d+) (\d+)/;
    const confRegex = /x_wconf (\d+)/;
    const bboxMatch = bboxRegex.exec(titleAttr);
    const confMatch = confRegex.exec(titleAttr);

    if (bboxMatch) {
      words.push({
        text: text,
        bbox: {
          x0: Number.parseInt(bboxMatch[1], 10),
          y0: Number.parseInt(bboxMatch[2], 10),
          x1: Number.parseInt(bboxMatch[3], 10),
          y1: Number.parseInt(bboxMatch[4], 10),
        },
        confidence: confMatch ? Number.parseInt(confMatch[1], 10) : 0,
      });
    }
  });

  return words;
};

