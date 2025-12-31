'use client';

import { useState, useCallback } from 'react';
import { changePermissions } from '../lib/change-permissions-logic';
import { downloadFile } from '@/lib/pdf/file-utils';
import type {
  UseChangePermissionsReturn,
  PDFPermissions,
} from '../types';

const defaultPermissions: PDFPermissions = {
  allowPrinting: true,
  allowCopying: true,
  allowModifying: true,
  allowAnnotating: true,
  allowFillingForms: true,
  allowDocumentAssembly: true,
  allowPageExtraction: true,
};

export const useChangePermissions = (): UseChangePermissionsReturn => {
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newUserPassword, setNewUserPassword] = useState<string>('');
  const [newOwnerPassword, setNewOwnerPassword] = useState<string>('');
  const [permissions, setPermissions] =
    useState<PDFPermissions>(defaultPermissions);

  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const loadPDF = useCallback(async (file: File) => {
    if (file?.type !== 'application/pdf') {
      setPdfError('Please select a valid PDF file.');
      return;
    }

    setIsLoadingPDF(true);
    setPdfError(null);

    try {
      setPdfFile(file);
    } catch (err) {
      console.error('Error loading PDF:', err);
      setPdfError(
        err instanceof Error
          ? err.message
          : 'Could not load PDF. It may be corrupted.'
      );
    } finally {
      setIsLoadingPDF(false);
    }
  }, []);

  const processPermissions = useCallback(async () => {
    if (!pdfFile) {
      setError('Please upload a PDF file first.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setLoadingMessage('Initializing...');

    try {
      setLoadingMessage('Reading PDF...');
      setLoadingMessage('Processing PDF permissions...');

      const blob = await changePermissions(pdfFile, {
        currentPassword,
        newUserPassword,
        newOwnerPassword,
        permissions,
      });

      setLoadingMessage('Preparing download...');
      downloadFile(blob, pdfFile.name);

      const shouldEncrypt = newUserPassword || newOwnerPassword;
      const successMsg = shouldEncrypt
        ? 'PDF permissions changed successfully!'
        : 'PDF decrypted successfully! All encryption and restrictions removed.';

      setSuccess(successMsg);
    } catch (err) {
      console.error('Error changing PDF permissions:', err);

      if (err instanceof Error) {
        if (err.message === 'INVALID_PASSWORD') {
          setError(
            'The current password you entered is incorrect. Please try again.'
          );
        } else if (err.message === 'PASSWORD_REQUIRED') {
          setError(
            'This PDF is password-protected. Please enter the current password to proceed.'
          );
        } else {
          setError(
            `An error occurred: ${err.message || 'The PDF might be corrupted or password protected.'}`
          );
        }
      } else {
        setError(
          'An error occurred while processing the PDF. Please try again.'
        );
      }
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  }, [
    pdfFile,
    currentPassword,
    newUserPassword,
    newOwnerPassword,
    permissions,
  ]);

  const setPermission = useCallback(
    (key: keyof PDFPermissions, value: boolean) => {
      setPermissions((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const reset = useCallback(() => {
    setCurrentPassword('');
    setNewUserPassword('');
    setNewOwnerPassword('');
    setPermissions(defaultPermissions);
    setPdfFile(null);
    setPdfError(null);
    setError(null);
    setSuccess(null);
    setLoadingMessage(null);
    setIsProcessing(false);
    setIsLoadingPDF(false);
  }, []);

  return {
    currentPassword,
    newUserPassword,
    newOwnerPassword,
    permissions,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc: null,
    isLoadingPDF,
    pdfError,
    totalPages: 0,
    setCurrentPassword,
    setNewUserPassword,
    setNewOwnerPassword,
    setPermission,
    loadPDF,
    processPermissions,
    reset,
  };
};

