'use client';

import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { useFileInfoLoader } from '@/hooks/useFileInfoLoader';
import { createPdfFromText } from '../lib/txt-to-pdf-logic';
import { saveAndDownloadPDF, downloadFile, formatBytes } from '@/lib/pdf/file-utils';
import type { UseTxtToPdfReturn, FontFamily, PageSize } from '../types';

export const useTxtToPdf = (): UseTxtToPdfReturn => {
  const {
    fileInfos: txtFiles,
    isLoading,
    loadingMessage: fileLoadingMessage,
    error: fileError,
    success: fileSuccess,
    loadFiles,
    removeFile,
    reset: resetFiles,
  } = useFileInfoLoader({
    acceptMimeTypes: ['text/plain'],
    acceptExtensions: ['.txt'],
    errorMessages: {
      noFiles: 'Please select at least one text file.',
      noValidFiles: 'No valid text files were found.',
      invalidFiles: (fileNames: string[]) =>
        `The following files are not valid text files: ${fileNames.join(', ')}`,
    },
  });

  const [textInput, setTextInput] = useState<string>('');

  const [fontFamily, setFontFamily] = useState<FontFamily>('Helvetica');
  const [fontSize, setFontSize] = useState<number>(12);
  const [pageSize, setPageSize] = useState<PageSize>('A4');
  const [textColor, setTextColor] = useState<string>('#000000');

  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadTxtFiles = useCallback(
    async (files: File[]) => {
      await loadFiles(files);
    },
    [loadFiles]
  );

  const removeTxtFile = useCallback(
    (id: string) => {
      removeFile(id);
    },
    [removeFile]
  );

  const processTxtToPdf = useCallback(async () => {
    const isUploadMode = txtFiles.length > 0;

    if (isUploadMode) {
      if (txtFiles.length === 0) {
        setError('Please upload at least one text file.');
        return;
      }

      setIsProcessing(true);
      setError(null);
      setSuccess(null);

      try {
        if (txtFiles.length === 1) {
          setLoadingMessage('Creating PDF...');
          const file = txtFiles[0].file;
          const text = await file.text();
          const pdfBytes = await createPdfFromText(
            text,
            fontFamily,
            fontSize,
            pageSize,
            textColor
          );

          const baseName = file.name.replace(/\.txt$/i, '');
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const pdfFileName = `${timestamp}_${baseName}.pdf`;
          saveAndDownloadPDF(pdfBytes, file.name, pdfFileName);

          setSuccess('PDF created successfully! Download started.');
          resetFiles();
        } else {
          setLoadingMessage('Creating PDFs and ZIP archive...');
          const zip = new JSZip();
          let totalSize = 0;

          for (const fileInfo of txtFiles) {
            const text = await fileInfo.file.text();
            const pdfBytes = await createPdfFromText(
              text,
              fontFamily,
              fontSize,
              pageSize,
              textColor
            );
            const baseName = fileInfo.fileName.replace(/\.txt$/i, '');
            zip.file(`${baseName}.pdf`, pdfBytes);
            totalSize += pdfBytes.length;
          }

          setLoadingMessage('Preparing ZIP download...');
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          const baseName =
            txtFiles[0]?.fileName.replace(/\.txt$/i, '') || 'text-to-pdf';
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const zipFileName = `${timestamp}_${baseName}.zip`;
          downloadFile(zipBlob, undefined, zipFileName);

          const successMessage = `Conversion completed! ${txtFiles.length} PDF(s) in zip file (${formatBytes(totalSize)}). Download started.`;
          setSuccess(successMessage);
          resetFiles();
        }
      } catch (err) {
        console.error('Error converting text to PDF:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'An error occurred while creating PDF from text.'
        );
      } finally {
        setIsProcessing(false);
        setLoadingMessage(null);
      }
    } else {
      if (!textInput.trim()) {
        setError('Please enter some text to convert.');
        return;
      }

      setIsProcessing(true);
      setError(null);
      setSuccess(null);
      setLoadingMessage('Creating PDF...');

      try {
        const pdfBytes = await createPdfFromText(
          textInput,
          fontFamily,
          fontSize,
          pageSize,
          textColor
        );

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const pdfFileName = `${timestamp}_text-document.pdf`;
        saveAndDownloadPDF(pdfBytes, undefined, pdfFileName);
        setSuccess('PDF created successfully! Download started.');
        setTextInput('');
      } catch (err) {
        console.error('Error converting text to PDF:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'An error occurred while creating PDF from text.'
        );
      } finally {
        setIsProcessing(false);
        setLoadingMessage(null);
      }
    }
  }, [txtFiles, textInput, fontFamily, fontSize, pageSize, textColor, resetFiles]);

  const reset = useCallback(() => {
    resetFiles();
    setTextInput('');
    setError(null);
    setSuccess(null);
    setIsProcessing(false);
    setLoadingMessage(null);
  }, [resetFiles]);

  return {
    txtFiles,
    isLoading,
    fileLoadingMessage,
    fileError,
    fileSuccess,
    loadTxtFiles,
    removeTxtFile,
    
    textInput,
    setTextInput,
    
    fontFamily,
    fontSize,
    pageSize,
    textColor,
    setFontFamily,
    setFontSize,
    setPageSize,
    setTextColor,
    
    isProcessing,
    loadingMessage,
    error,
    success,
    processTxtToPdf,
    reset,
  };
};

