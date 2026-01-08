export const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export const formatBytes = (bytes: number, decimals = 1): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  );
};

function formatTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    "application/pdf": "pdf",
    "application/zip": "zip",
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/bmp": "bmp",
    "image/tiff": "tiff",
    "text/markdown": "md",
    "text/plain": "txt",
    "application/json": "json",
    "text/html": "html",
    "application/xml": "xml",
    "text/xml": "xml",
  };

  const baseMimeType = mimeType.split(";")[0].trim().toLowerCase();
  return mimeToExt[baseMimeType] || "bin";
}

export const downloadFile = (
  blob: Blob,
  originalFileName?: string,
  filename?: string,
): void => {
  let finalFilename: string;

  if (filename) {
    finalFilename = filename;
  } else {
    const timestamp = formatTimestamp();
    let baseName = "document";
    let extension = getExtensionFromMimeType(blob.type);

    if (originalFileName) {
      const lastDotIndex = originalFileName.lastIndexOf(".");
      if (lastDotIndex > 0) {
        baseName = originalFileName.substring(0, lastDotIndex);
        extension = originalFileName.substring(lastDotIndex + 1);
      } else {
        baseName = originalFileName;
      }
    }

    finalFilename = `${timestamp}_${baseName}.${extension}`;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = finalFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: Number.parseInt(result[1], 16) / 255,
        g: Number.parseInt(result[2], 16) / 255,
        b: Number.parseInt(result[3], 16) / 255,
      }
    : { r: 0, g: 0, b: 0 };
};

export const parsePageRanges = (
  rangeString: string,
  totalPages: number,
): number[] => {
  if (!rangeString || rangeString.trim() === "") {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const indices = new Set<number>();
  const parts = rangeString.split(",");

  for (const part of parts) {
    const trimmedPart = part.trim();
    if (!trimmedPart) continue;

    if (trimmedPart.includes("-")) {
      const [start, end] = trimmedPart.split("-").map(Number);
      if (
        isNaN(start) ||
        isNaN(end) ||
        start < 1 ||
        end > totalPages ||
        start > end
      ) {
        console.warn(`Invalid range skipped: ${trimmedPart}`);
        continue;
      }

      for (let i = start; i <= end; i++) {
        indices.add(i - 1);
      }
    } else {
      const pageNum = Number(trimmedPart);

      if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
        console.warn(`Invalid page number skipped: ${trimmedPart}`);
        continue;
      }
      indices.add(pageNum - 1);
    }
  }

  return Array.from(indices).sort((a, b) => a - b);
};

export const saveAndDownloadPDF = (
  pdfBytes: Uint8Array,
  originalFileName?: string,
  customFilename?: string,
): void => {
  const arrayBuffer = new ArrayBuffer(pdfBytes.length);
  new Uint8Array(arrayBuffer).set(pdfBytes);
  const blob = new Blob([arrayBuffer], { type: "application/pdf" });
  downloadFile(blob, originalFileName, customFilename);
};
