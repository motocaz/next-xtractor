import { readFileAsArrayBuffer } from "@/lib/pdf/file-utils";

export const pdfsToZip = async (files: File[]): Promise<Blob> => {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  for (const file of files) {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    zip.file(file.name, arrayBuffer);
  }

  return await zip.generateAsync({ type: "blob" });
};
