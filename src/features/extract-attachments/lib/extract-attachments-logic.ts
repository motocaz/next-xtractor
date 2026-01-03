'use client';

import { readFileAsArrayBuffer } from '@/lib/pdf/file-utils';
import type {
  ExtractAttachmentsMessage,
  ExtractAttachmentResponse,
  AttachmentData,
} from '../types';

let workerInstance: Worker | null = null;

const getWorker = (): Worker => {
  workerInstance ??= new Worker(
    new URL(
      '/workers/extract-attachments.worker.js',
      globalThis.location.origin
    )
  );
  return workerInstance;
};

const createErrorHandler = (
  worker: Worker,
  messageHandler: (e: MessageEvent<ExtractAttachmentResponse>) => void,
  reject: (error: Error) => void
): ((error: ErrorEvent) => void) => {
  const errorHandler = (error: ErrorEvent) => {
    worker.removeEventListener('message', messageHandler);
    worker.removeEventListener('error', errorHandler);
    reject(
      new Error(
        error.message || 'Worker error occurred. Check console for details.'
      )
    );
  };
  return errorHandler;
};

export const extractAttachmentsFromPDFs = async (
  files: File[]
): Promise<AttachmentData[]> => {
  return new Promise((resolve, reject) => {
    if (files.length === 0) {
      reject(new Error('No files provided'));
      return;
    }

    const worker = getWorker();

    const fileBuffersPromise = Promise.all(
      files.map((file) => readFileAsArrayBuffer(file))
    );

    const messageHandler = (
      e: MessageEvent<ExtractAttachmentResponse>
    ): void => {
      const data = e.data;

      if (data.status === 'success') {
        worker.removeEventListener('message', messageHandler);
        worker.removeEventListener('error', errorHandler);

        const attachments: AttachmentData[] = data.attachments.map((att) => ({
          name: att.name,
          data: att.data,
        }));

        resolve(attachments);
      } else if (data.status === 'error') {
        worker.removeEventListener('message', messageHandler);
        worker.removeEventListener('error', errorHandler);
        reject(new Error(data.message || 'Unknown error occurred.'));
      }
    };

    const errorHandler = createErrorHandler(worker, messageHandler, reject);

    worker.addEventListener('message', messageHandler);
    worker.addEventListener('error', errorHandler);

    fileBuffersPromise
      .then((fileBuffers) => {
        const fileNames = files.map((file) => file.name);

        const message: ExtractAttachmentsMessage = {
          command: 'extract-attachments',
          fileBuffers,
          fileNames,
        };

        const transferables = fileBuffers.map((buf) => buf);
        worker.postMessage(message, transferables);
      })
      .catch((error) => {
        worker.removeEventListener('message', messageHandler);
        worker.removeEventListener('error', errorHandler);
        reject(error);
      });
  });
};

