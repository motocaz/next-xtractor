"use client";

import { useState, useCallback } from "react";

export interface FileInfo {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
}

export interface UseFileInfoLoaderOptions {
  acceptMimeTypes?: string[];
  acceptExtensions?: string[];
  errorMessages?: {
    noFiles?: string;
    noValidFiles?: string;
    invalidFiles?: (fileNames: string[]) => string;
    loadFailed?: (fileName: string) => string;
  };
}

export interface UseFileInfoLoaderReturn {
  fileInfos: FileInfo[];
  isLoading: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  loadFiles: (files: File[]) => Promise<void>;
  removeFile: (id: string) => void;
  reset: () => void;
}

const DEFAULT_ERROR_MESSAGES = {
  noFiles: "Please select at least one file.",
  noValidFiles: "No valid files were found.",
  invalidFiles: (fileNames: string[]) =>
    `The following files are not valid: ${fileNames.join(", ")}`,
  loadFailed: (fileName: string) =>
    `Failed to load ${fileName}. Please check your file.`,
};

export const useFileInfoLoader = (
  options: UseFileInfoLoaderOptions = {},
): UseFileInfoLoaderReturn => {
  const {
    acceptMimeTypes = [],
    acceptExtensions = [],
    errorMessages = {},
  } = options;

  const messages = { ...DEFAULT_ERROR_MESSAGES, ...errorMessages };

  const [fileInfos, setFileInfos] = useState<FileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      if (acceptMimeTypes.length === 0 && acceptExtensions.length === 0) {
        return true;
      }

      const matchesMimeType =
        acceptMimeTypes.length === 0 ||
        acceptMimeTypes.some((mimeType) => file.type === mimeType);

      const fileNameLower = file.name.toLowerCase();
      const matchesExtension =
        acceptExtensions.length === 0 ||
        acceptExtensions.some((ext) =>
          fileNameLower.endsWith(ext.toLowerCase()),
        );

      return matchesMimeType || matchesExtension;
    },
    [acceptMimeTypes, acceptExtensions],
  );

  const loadFiles = useCallback(
    async (files: File[]) => {
      if (!files || files.length === 0) {
        setError(messages.noFiles);
        return;
      }

      setIsLoading(true);
      setError(null);
      setSuccess(null);
      setLoadingMessage("Validating files...");

      try {
        const validFiles: FileInfo[] = [];
        const invalidFiles: string[] = [];

        for (const file of files) {
          if (!validateFile(file)) {
            invalidFiles.push(file.name);
            continue;
          }

          const id = `${file.name}-${Date.now()}-${Math.random()}`;
          validFiles.push({
            id,
            file,
            fileName: file.name,
            fileSize: file.size,
          });
        }

        if (invalidFiles.length > 0) {
          setError(messages.invalidFiles(invalidFiles));
        }

        if (validFiles.length === 0) {
          setError(messages.noValidFiles);
        } else {
          setFileInfos((prev) => [...prev, ...validFiles]);
          if (validFiles.length > 0 && invalidFiles.length === 0) {
            setSuccess(`${validFiles.length} file(s) loaded successfully.`);
          }
        }
      } catch (err) {
        console.error("Error loading files:", err);
        setError(
          err instanceof Error
            ? `Failed to load files: ${err.message}`
            : "Failed to load files. Please check your files.",
        );
      } finally {
        setIsLoading(false);
        setLoadingMessage(null);
      }
    },
    [validateFile, messages],
  );

  const removeFile = useCallback((id: string) => {
    setFileInfos((prev) => prev.filter((fileInfo) => fileInfo.id !== id));
    setError(null);
    setSuccess(null);
  }, []);

  const reset = useCallback(() => {
    setFileInfos([]);
    setIsLoading(false);
    setLoadingMessage(null);
    setError(null);
    setSuccess(null);
  }, []);

  return {
    fileInfos,
    isLoading,
    loadingMessage,
    error,
    success,
    loadFiles,
    removeFile,
    reset,
  };
};
