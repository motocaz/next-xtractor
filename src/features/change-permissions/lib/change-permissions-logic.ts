'use client';

import createModule from '@neslinesli93/qpdf-wasm';
import { readFileAsArrayBuffer } from '@/lib/pdf/file-utils';
import type { ChangePermissionsOptions } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let qpdfInstance: any = null;

const initializeQpdf = async () => {
  if (qpdfInstance) return qpdfInstance;

  try {
    qpdfInstance = await createModule({
      locateFile: () => '/qpdf.wasm',
    });
  } catch (error) {
    console.error('Failed to initialize qpdf-wasm:', error);
    throw new Error(
      'Could not load the PDF engine. Please refresh the page and try again.'
    );
  }

  return qpdfInstance;
};

export const changePermissions = async (
  file: File,
  options: ChangePermissionsOptions
): Promise<Blob> => {
  const inputPath = '/input.pdf';
  const outputPath = '/output.pdf';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let qpdf: any;

  try {
    qpdf = await initializeQpdf();

    const fileBuffer = await readFileAsArrayBuffer(file);
    const uint8Array = new Uint8Array(fileBuffer as ArrayBuffer);
    qpdf.FS.writeFile(inputPath, uint8Array);

    const args = [inputPath];

    // Add password if provided
    if (options.currentPassword) {
      args.push('--password=' + options.currentPassword);
    }

    const shouldEncrypt =
      options.newUserPassword || options.newOwnerPassword;

    if (shouldEncrypt) {
      const finalUserPassword = options.newUserPassword;
      const finalOwnerPassword = options.newOwnerPassword;

      args.push('--encrypt', finalUserPassword, finalOwnerPassword, '256');

      const {
        allowPrinting,
        allowCopying,
        allowModifying,
        allowAnnotating,
        allowFillingForms,
        allowDocumentAssembly,
        allowPageExtraction,
      } = options.permissions;

      if (finalOwnerPassword) {
        if (!allowModifying) args.push('--modify=none');
        if (!allowCopying) args.push('--extract=n');
        if (!allowPrinting) args.push('--print=none');
        if (!allowAnnotating) args.push('--annotate=n');
        if (!allowDocumentAssembly) args.push('--assemble=n');
        if (!allowFillingForms) args.push('--form=n');
        if (!allowPageExtraction) args.push('--extract=n');
        if (!allowModifying) args.push('--modify-other=n');
      } else if (finalUserPassword) {
        args.push('--allow-insecure');
      }
    } else {
      args.push('--decrypt');
    }

    args.push('--', outputPath);

    try {
      qpdf.callMain(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (qpdfError: any) {
      console.error('qpdf execution error:', qpdfError);

      const errorMsg = qpdfError.message || '';

      if (
        errorMsg.includes('invalid password') ||
        errorMsg.includes('incorrect password') ||
        errorMsg.includes('password')
      ) {
        throw new Error('INVALID_PASSWORD');
      }

      if (
        errorMsg.includes('encrypted') ||
        errorMsg.includes('password required')
      ) {
        throw new Error('PASSWORD_REQUIRED');
      }

      throw new Error(
        'Processing failed: ' + (errorMsg || 'Unknown error')
      );
    }

    const outputFile = qpdf.FS.readFile(outputPath, { encoding: 'binary' });

    if (!outputFile || outputFile.length === 0) {
      throw new Error('Processing resulted in an empty file.');
    }

    const blob = new Blob([outputFile], { type: 'application/pdf' });
    return blob;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error during PDF permission change:', error);
    throw error;
  } finally {
    try {
      if (qpdf?.FS) {
        try {
          qpdf.FS.unlink(inputPath);
        } catch {
        }
        try {
          qpdf.FS.unlink(outputPath);
        } catch {
        }
      }
    } catch (cleanupError) {
      console.warn('Failed to cleanup WASM FS:', cleanupError);
    }
  }
};

