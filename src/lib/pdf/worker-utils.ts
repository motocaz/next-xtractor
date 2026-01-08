"use client";

export const createWorkerErrorHandler = <TResponse>(
  worker: Worker,
  messageHandler: (e: MessageEvent<TResponse>) => void,
  reject: (error: Error) => void,
): ((error: ErrorEvent) => void) => {
  const errorHandler = (error: ErrorEvent) => {
    worker.removeEventListener("message", messageHandler);
    worker.removeEventListener("error", errorHandler);
    reject(
      new Error(
        error.message || "Worker error occurred. Check console for details.",
      ),
    );
  };
  return errorHandler;
};

export const cleanupWorkerListeners = <TResponse>(
  worker: Worker,
  messageHandler: (e: MessageEvent<TResponse>) => void,
  errorHandler: (error: ErrorEvent) => void,
): void => {
  worker.removeEventListener("message", messageHandler);
  worker.removeEventListener("error", errorHandler);
};

export const handleWorkerErrorResponse = <
  TResponse extends { status: string; message?: string },
>(
  worker: Worker,
  messageHandler: (e: MessageEvent<TResponse>) => void,
  errorHandler: (error: ErrorEvent) => void,
  data: TResponse,
  reject: (error: Error) => void,
): boolean => {
  if (data.status === "error") {
    cleanupWorkerListeners(worker, messageHandler, errorHandler);
    reject(new Error(data.message || "Unknown error occurred."));
    return true;
  }
  return false;
};
