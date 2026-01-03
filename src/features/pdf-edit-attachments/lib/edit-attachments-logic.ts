'use client';

import { readFileAsArrayBuffer } from '@/lib/pdf/file-utils';
import type {
  AttachmentInfo,
  WorkerGetAttachmentsMessage,
  WorkerEditAttachmentsMessage,
  WorkerResponse,
} from '../types';

let workerInstance: Worker | null = null;

const getWorker = (): Worker => {
  if (!workerInstance) {
    workerInstance = new Worker(
      new URL('/workers/edit-attachments.worker.js', window.location.origin)
    );
  }
  return workerInstance;
};

export const getAttachmentsFromPDF = async (
  file: File
): Promise<AttachmentInfo[]> => {
  return new Promise((resolve, reject) => {
    const worker = getWorker();
    const fileBufferPromise = readFileAsArrayBuffer(file);

    const messageHandler = (e: MessageEvent<WorkerResponse>) => {
      const data = e.data;

      if (data.status === 'success' && data.attachments !== undefined) {
        worker.removeEventListener('message', messageHandler);
        worker.removeEventListener('error', errorHandler);

        const attachments: AttachmentInfo[] = data.attachments.map((att) => ({
          ...att,
          data: new Uint8Array(att.data),
        }));

        resolve(attachments);
      } else if (data.status === 'error') {
        worker.removeEventListener('message', messageHandler);
        worker.removeEventListener('error', errorHandler);
        reject(new Error(data.message || 'Unknown error occurred.'));
      }
    };

    const errorHandler = (error: ErrorEvent) => {
      worker.removeEventListener('message', messageHandler);
      worker.removeEventListener('error', errorHandler);
      reject(
        new Error(
          error.message || 'Worker error occurred. Check console for details.'
        )
      );
    };

    worker.addEventListener('message', messageHandler);
    worker.addEventListener('error', errorHandler);

    fileBufferPromise
      .then((fileBuffer) => {
        const message: WorkerGetAttachmentsMessage = {
          command: 'get-attachments',
          fileBuffer: fileBuffer,
          fileName: file.name,
        };

        worker.postMessage(message, [fileBuffer]);
      })
      .catch((error) => {
        worker.removeEventListener('message', messageHandler);
        worker.removeEventListener('error', errorHandler);
        reject(error);
      });
  });
};

export const editAttachmentsInPDF = async (
  file: File,
  indicesToRemove: number[]
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const worker = getWorker();
    const fileBufferPromise = readFileAsArrayBuffer(file);

    const messageHandler = (e: MessageEvent<WorkerResponse>) => {
      const data = e.data;

      if (data.status === 'success' && data.modifiedPDF !== undefined) {
        worker.removeEventListener('message', messageHandler);
        worker.removeEventListener('error', errorHandler);

        const blob = new Blob([new Uint8Array(data.modifiedPDF)], {
          type: 'application/pdf',
        });
        resolve(blob);
      } else if (data.status === 'error') {
        worker.removeEventListener('message', messageHandler);
        worker.removeEventListener('error', errorHandler);
        reject(new Error(data.message || 'Unknown error occurred.'));
      }
    };

    const errorHandler = (error: ErrorEvent) => {
      worker.removeEventListener('message', messageHandler);
      worker.removeEventListener('error', errorHandler);
      reject(
        new Error(
          error.message || 'Worker error occurred. Check console for details.'
        )
      );
    };

    worker.addEventListener('message', messageHandler);
    worker.addEventListener('error', errorHandler);

    fileBufferPromise
      .then((fileBuffer) => {
        const message: WorkerEditAttachmentsMessage = {
          command: 'edit-attachments',
          fileBuffer: fileBuffer,
          fileName: file.name,
          attachmentsToRemove: indicesToRemove,
        };

        worker.postMessage(message, [fileBuffer]);
      })
      .catch((error) => {
        worker.removeEventListener('message', messageHandler);
        worker.removeEventListener('error', errorHandler);
        reject(error);
      });
  });
};

