"use client";

import { readFileAsArrayBuffer } from "@/lib/pdf/file-utils";
import {
  createWorkerErrorHandler,
  cleanupWorkerListeners,
  handleWorkerErrorResponse,
} from "@/lib/pdf/worker-utils";
import type { GenerateTOCMessage, TOCWorkerResponse } from "../types";

let workerInstance: Worker | null = null;

const getWorker = (): Worker => {
  workerInstance ??= new Worker(
    new URL("/workers/table-of-contents.worker.js", globalThis.location.origin),
  );
  return workerInstance;
};

export const generateTableOfContents = async (
  pdfFile: File,
  options: {
    title: string;
    fontSize: number;
    fontFamily: number;
    addBookmark: boolean;
  },
): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const worker = getWorker();

    const fileBufferPromise = readFileAsArrayBuffer(pdfFile);

    const messageHandler = (e: MessageEvent<TOCWorkerResponse>): void => {
      const data = e.data;

      if (data.status === "success") {
        cleanupWorkerListeners(worker, messageHandler, errorHandler);

        const pdfBytes = new Uint8Array(data.pdfBytes);
        resolve(pdfBytes);
      } else if (
        handleWorkerErrorResponse(
          worker,
          messageHandler,
          errorHandler,
          data,
          reject,
        )
      ) {
        return;
      }
    };

    const errorHandler = createWorkerErrorHandler(
      worker,
      messageHandler,
      reject,
    );

    worker.addEventListener("message", messageHandler);
    worker.addEventListener("error", errorHandler);

    fileBufferPromise
      .then((fileBuffer) => {
        const message: GenerateTOCMessage = {
          command: "generate-toc",
          pdfData: fileBuffer,
          title: options.title,
          fontSize: options.fontSize,
          fontFamily: options.fontFamily,
          addBookmark: options.addBookmark,
        };

        worker.postMessage(message, [fileBuffer]);
      })
      .catch((error) => {
        cleanupWorkerListeners(worker, messageHandler, errorHandler);
        reject(error);
      });
  });
};
