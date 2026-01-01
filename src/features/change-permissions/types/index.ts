export interface PDFPermissions {
  allowPrinting: boolean;
  allowCopying: boolean;
  allowModifying: boolean;
  allowAnnotating: boolean;
  allowFillingForms: boolean;
  allowDocumentAssembly: boolean;
  allowPageExtraction: boolean;
}

export interface ChangePermissionsOptions {
  currentPassword: string;
  newUserPassword: string;
  newOwnerPassword: string;
  permissions: PDFPermissions;
}

import type { PDFDocument } from 'pdf-lib';

export interface UseChangePermissionsReturn {
  currentPassword: string;
  newUserPassword: string;
  newOwnerPassword: string;
  permissions: PDFPermissions;
  isProcessing: boolean;
  loadingMessage: string | null;
  error: string | null;
  success: string | null;
  pdfFile: File | null;
  pdfDoc: PDFDocument | null;
  isLoadingPDF: boolean;
  pdfError: string | null;
  totalPages: number;

  setCurrentPassword: (password: string) => void;
  setNewUserPassword: (password: string) => void;
  setNewOwnerPassword: (password: string) => void;
  setPermission: (key: keyof PDFPermissions, value: boolean) => void;
  loadPDF: (file: File) => Promise<void>;
  processPermissions: () => Promise<void>;
  reset: () => void;
}

