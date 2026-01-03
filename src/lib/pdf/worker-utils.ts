'use client';

export const createWorkerErrorHandler = <TResponse>(
  worker: Worker,
  messageHandler: (e: MessageEvent<TResponse>) => void,
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

