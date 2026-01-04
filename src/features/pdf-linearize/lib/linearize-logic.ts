'use client';

import {
  initializeQpdf,
  prepareQpdfFile,
  readQpdfOutput,
  cleanupQpdfFiles,
} from '@/lib/pdf/qpdf-utils';

export interface LinearizedPDF {
  fileName: string;
  blob: Blob;
}

export const linearizePDFs = async (
  files: File[],
  onProgress?: (current: number, total: number, fileName: string) => void
): Promise<LinearizedPDF[]> => {
  if (files.length === 0) {
    throw new Error('No PDF files provided');
  }

  const qpdf = await initializeQpdf();

  const results: LinearizedPDF[] = [];
  let successCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const inputPath = `/input_${i}.pdf`;
    const outputPath = `/output_${i}.pdf`;

    onProgress?.(i + 1, files.length, file.name);

    try {
      await prepareQpdfFile(qpdf, file, inputPath);

      qpdf.callMain([inputPath, '--linearize', outputPath]);

      const blob = readQpdfOutput(
        qpdf,
        outputPath,
        `Linearization resulted in an empty file for ${file.name}.`
      );

      results.push({
        fileName: `linearized-${file.name}`,
        blob,
      });

      successCount++;
    } catch (fileError) {
      console.error(`Failed to linearize ${file.name}:`, fileError);
    } finally {
      cleanupQpdfFiles(qpdf, inputPath, outputPath);
    }
  }

  if (successCount === 0) {
    throw new Error('No PDF files could be linearized.');
  }

  return results;
};

