'use client';

import {
  initializeQpdf,
  prepareQpdfFile,
  readQpdfOutput,
  cleanupQpdfFiles,
} from '@/lib/pdf/qpdf-utils';
import type { ChangePermissionsOptions } from '../types';

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

    await prepareQpdfFile(qpdf, file, inputPath);

    const args = [inputPath];

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

    const blob = readQpdfOutput(
      qpdf,
      outputPath,
      'Processing resulted in an empty file.'
    );
    return blob;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error during PDF permission change:', error);
    throw error;
  } finally {
    cleanupQpdfFiles(qpdf, inputPath, outputPath);
  }
};

