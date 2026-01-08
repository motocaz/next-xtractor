import type { PDFDocument } from "pdf-lib";
import { readFileAsArrayBuffer } from "@/lib/pdf/file-utils";

export interface AttachmentProgress {
  current: number;
  total: number;
  fileName: string;
}

export const addAttachmentsToPDF = async (
  pdfDoc: PDFDocument,
  files: File[],
  onProgress?: (progress: AttachmentProgress) => void,
): Promise<Uint8Array> => {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (onProgress) {
      onProgress({
        current: i + 1,
        total: files.length,
        fileName: file.name,
      });
    }

    const fileBytes = await readFileAsArrayBuffer(file);

    await pdfDoc.attach(fileBytes as ArrayBuffer, file.name, {
      mimeType: file.type || "application/octet-stream",
      description: `Attached file: ${file.name}`,
      creationDate: new Date(),
      modificationDate: new Date(file.lastModified),
    });
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
