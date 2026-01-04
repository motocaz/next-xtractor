"use client";

import Tesseract from "tesseract.js";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { readFileAsArrayBuffer } from "@/lib/pdf/file-utils";
import { parseHOCR } from "./hocr-parser";
import { sanitizeTextForWinAnsi } from "./text-sanitizer";
import { binarizeCanvas } from "./canvas-binarizer";
import type { OCRProgress, OCRResolution } from "../types";

export interface ProcessOCRParams {
  file: File;
  selectedLanguages: string[];
  resolution: OCRResolution;
  binarize: boolean;
  whitelist: string;
  onProgress: (progress: OCRProgress) => void;
}

export interface ProcessOCRResult {
  searchablePdfBytes: Uint8Array;
  extractedText: string;
}

export const processOCR = async ({
  file,
  selectedLanguages,
  resolution,
  binarize,
  whitelist,
  onProgress,
}: ProcessOCRParams): Promise<ProcessOCRResult> => {
  if (selectedLanguages.length === 0) {
    throw new Error("At least one language must be selected");
  }

  const langString = selectedLanguages.join("+");
  const scale = Number.parseFloat(resolution);

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/f762071c-732c-417a-b25c-e99ab42743d6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ocr-logic.ts:37',message:'Before Tesseract worker creation',data:{langString,selectedLanguages,scale,resolution,tesseractVersion:typeof Tesseract !== 'undefined' ? 'loaded' : 'not loaded'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
  // #endregion

  const { loadPDFWithPDFJSFromBuffer } = await import("@/lib/pdf/pdfjs-loader");
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const pdf = await loadPDFWithPDFJSFromBuffer(arrayBuffer);

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/f762071c-732c-417a-b25c-e99ab42743d6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ocr-logic.ts:44',message:'About to create Tesseract worker',data:{langString,workerOptions:{logger:'present'},hasTesseractCreateWorker:typeof Tesseract?.createWorker === 'function'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
  // #endregion

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/f762071c-732c-417a-b25c-e99ab42743d6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ocr-logic.ts:52',message:'Checking Tesseract options',data:{hasTesseract:typeof Tesseract !== 'undefined',tesseractKeys:typeof Tesseract !== 'undefined' ? Object.keys(Tesseract) : [],createWorkerType:typeof Tesseract?.createWorker},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,C'})}).catch(()=>{});
  // #endregion

  let worker;
  try {
    // Configure worker to use local path instead of CDN
    const workerOptions: {
      logger?: (m: { status?: string; progress?: number }) => void;
      workerPath?: string;
    } = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      logger: (m: any) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/f762071c-732c-417a-b25c-e99ab42743d6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ocr-logic.ts:60',message:'Tesseract logger callback',data:{status:m?.status,progress:m?.progress,workerProgress:m},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
        // #endregion
        onProgress({
          status: m.status || "Processing...",
          progress: m.progress || 0,
        });
      },
    };

    // Try to configure worker path to use local bundle instead of CDN
    if (typeof window !== 'undefined') {
      // Use worker from node_modules instead of CDN
      try {
        const workerPath = new URL('tesseract.js/dist/worker.min.js', import.meta.url).href;
        workerOptions.workerPath = workerPath;
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/f762071c-732c-417a-b25c-e99ab42743d6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ocr-logic.ts:72',message:'Setting worker path',data:{workerPath,hasWorkerPath:!!workerOptions.workerPath},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,C'})}).catch(()=>{});
        // #endregion
      } catch (pathError) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/f762071c-732c-417a-b25c-e99ab42743d6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ocr-logic.ts:77',message:'Failed to set worker path, will use default',data:{error:pathError instanceof Error ? pathError.message : String(pathError)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,C'})}).catch(()=>{});
        // #endregion
      }
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f762071c-732c-417a-b25c-e99ab42743d6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ocr-logic.ts:82',message:'Creating worker with options',data:{langString,workerOptionsKeys:Object.keys(workerOptions),hasWorkerPath:!!workerOptions.workerPath},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
    // #endregion

    worker = await Tesseract.createWorker(langString, 1, workerOptions);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f762071c-732c-417a-b25c-e99ab42743d6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ocr-logic.ts:60',message:'Tesseract worker created successfully',data:{hasWorker:!!worker,workerType:typeof worker},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
    // #endregion
  } catch (workerError) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f762071c-732c-417a-b25c-e99ab42743d6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ocr-logic.ts:64',message:'Tesseract worker creation failed',data:{error:workerError instanceof Error ? workerError.message : String(workerError),errorStack:workerError instanceof Error ? workerError.stack : undefined,errorName:workerError instanceof Error ? workerError.name : undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
    // #endregion
    throw workerError;
  }

  try {
    await worker.setParameters({
      tessjs_create_hocr: "1",
    });

    if (whitelist) {
      await worker.setParameters({
        tessedit_char_whitelist: whitelist,
      });
    }

    const newPdfDoc = await PDFDocument.create();
    const font = await newPdfDoc.embedFont(StandardFonts.Helvetica);
    let fullText = "";

    const totalPages = pdf.numPages;

    for (let i = 1; i <= totalPages; i++) {
      onProgress({
        status: `Processing page ${i} of ${totalPages}`,
        progress: (i - 1) / totalPages,
        currentPage: i,
        totalPages,
      });

      const page = await pdf.getPage(i);
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
        viewport,
        canvas,
      }).promise;

      if (binarize) {
        binarizeCanvas(context);
      }

      const result = await worker.recognize(
        canvas,
        {},
        { text: true, hocr: true }
      );
      const data = result.data;

      const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);

      const pngImageBytes = await new Promise<Uint8Array>((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            resolve(new Uint8Array(0));
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            resolve(new Uint8Array(reader.result as ArrayBuffer));
          };
          reader.onerror = () => {
            resolve(new Uint8Array(0));
          };
          reader.readAsArrayBuffer(blob);
        }, "image/png");
      });

      const pngImage = await newPdfDoc.embedPng(pngImageBytes);
      newPage.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
      });

      if (data.hocr) {
        const words = parseHOCR(data.hocr);

        words.forEach((word) => {
          const { x0, y0, x1, y1 } = word.bbox;
          const text = sanitizeTextForWinAnsi(word.text);

          if (!text.trim()) return;

          const bboxWidth = x1 - x0;
          const bboxHeight = y1 - y0;

          let fontSize = bboxHeight * 0.9;
          let textWidth = font.widthOfTextAtSize(text, fontSize);
          while (textWidth > bboxWidth && fontSize > 1) {
            fontSize -= 0.5;
            textWidth = font.widthOfTextAtSize(text, fontSize);
          }

          try {
            newPage.drawText(text, {
              x: x0,
              y: viewport.height - y1 + (bboxHeight - fontSize) / 2,
              font,
              size: fontSize,
              color: rgb(0, 0, 0),
              opacity: 0,
            });
          } catch (error) {
            console.warn(`Could not draw text "${text}":`, error);
          }
        });
      }

      fullText += data.text + "\n\n";
    }

    await worker.terminate();

    const searchablePdfBytes = await newPdfDoc.save();

    return {
      searchablePdfBytes,
      extractedText: fullText.trim(),
    };
  } catch (error) {
    await worker.terminate().catch(() => {});
    throw error;
  }
};
