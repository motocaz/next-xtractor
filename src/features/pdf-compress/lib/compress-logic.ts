'use client';

import { PDFDocument, PDFName, PDFDict, PDFStream, PDFNumber } from 'pdf-lib';
import { readFileAsArrayBuffer } from '@/lib/pdf/file-utils';
import { loadPDFWithPDFJSFromBuffer } from '@/lib/pdf/pdfjs-loader';
import type {
  CompressionLevel,
  CompressionAlgorithm,
  SmartCompressionSettings,
  LegacyCompressionSettings,
  CompressionSettings,
  CompressionResult,
} from '../types';

const dataUrlToBytes = (dataUrl: string): Uint8Array => {
  const base64 = dataUrl.split(',')[1];
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.codePointAt(i) ?? 0;
  }
  return bytes;
};

const removePDFMetadata = (pdfDoc: PDFDocument): void => {
  try {
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setCreator('');
    pdfDoc.setProducer('');
  } catch (e) {
    console.warn('Could not remove metadata:', e);
  }
};

const getImageDimensions = (
  stream: PDFStream
): { width: number; height: number } => {
  const width =
    stream.dict.get(PDFName.of('Width')) instanceof PDFNumber
      ? (stream.dict.get(PDFName.of('Width')) as PDFNumber).asNumber()
      : 0;
  const height =
    stream.dict.get(PDFName.of('Height')) instanceof PDFNumber
      ? (stream.dict.get(PDFName.of('Height')) as PDFNumber).asNumber()
      : 0;
  return { width, height };
};

const calculateNewDimensions = (
  width: number,
  height: number,
  settings: SmartCompressionSettings
): { newWidth: number; newHeight: number } | null => {
  const scaleFactor = settings.scaleFactor || 1;
  let newWidth = Math.floor(width * scaleFactor);
  let newHeight = Math.floor(height * scaleFactor);

  if (newWidth > settings.maxWidth || newHeight > settings.maxHeight) {
    const aspectRatio = newWidth / newHeight;
    if (newWidth > newHeight) {
      newWidth = Math.min(newWidth, settings.maxWidth);
      newHeight = newWidth / aspectRatio;
    } else {
      newHeight = Math.min(newHeight, settings.maxHeight);
      newWidth = newHeight * aspectRatio;
    }
  }

  const minDim = settings.minDimension || 50;
  if (newWidth < minDim || newHeight < minDim) {
    return null;
  }

  return {
    newWidth: Math.floor(newWidth),
    newHeight: Math.floor(newHeight),
  };
};

const loadImageFromBytes = (imageBytes: Uint8Array): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const arrayBuffer = new ArrayBuffer(imageBytes.length);
    new Uint8Array(arrayBuffer).set(imageBytes);
    const imageUrl = URL.createObjectURL(new Blob([arrayBuffer]));

    img.onload = () => {
      URL.revokeObjectURL(imageUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error('Failed to load image'));
    };
    img.src = imageUrl;
  });
};

const configureCanvasContext = (
  ctx: CanvasRenderingContext2D,
  settings: SmartCompressionSettings
): void => {
  ctx.imageSmoothingEnabled = settings.smoothing !== false;
  const smoothingQualityMap: Record<string, ImageSmoothingQuality> = {
    low: 'low',
    medium: 'medium',
    high: 'high',
  };
  ctx.imageSmoothingQuality =
    smoothingQualityMap[settings.smoothingQuality || 'medium'] || 'medium';

  if (settings.grayscale) {
    ctx.filter = 'grayscale(100%)';
  } else if (settings.contrast) {
    ctx.filter = `contrast(${settings.contrast}) brightness(${settings.brightness || 1})`;
  }
};

const compressImageOnCanvas = (
  canvas: HTMLCanvasElement,
  settings: SmartCompressionSettings
): { bestBytes: Uint8Array; bestSize: number } => {
  const jpegDataUrl = canvas.toDataURL('image/jpeg', settings.quality);
  const jpegBytes = dataUrlToBytes(jpegDataUrl);
  let bestBytes = jpegBytes;
  let bestSize = jpegBytes.length;

  if (settings.tryWebP) {
    try {
      const webpDataUrl = canvas.toDataURL('image/webp', settings.quality);
      const webpBytes = dataUrlToBytes(webpDataUrl);
      if (webpBytes.length < bestSize) {
        bestBytes = webpBytes;
        bestSize = webpBytes.length;
      }
    } catch {
      /* WebP not supported */
    }
  }

  return { bestBytes, bestSize };
};

const updateStreamWithCompressedImage = (
  stream: PDFStream,
  bestBytes: Uint8Array,
  bestSize: number,
  canvas: HTMLCanvasElement,
  settings: SmartCompressionSettings
): void => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (stream as any).contents = bestBytes;
  stream.dict.set(PDFName.of('Length'), PDFNumber.of(bestSize));
  stream.dict.set(PDFName.of('Width'), PDFNumber.of(canvas.width));
  stream.dict.set(PDFName.of('Height'), PDFNumber.of(canvas.height));
  stream.dict.set(PDFName.of('Filter'), PDFName.of('DCTDecode'));
  stream.dict.delete(PDFName.of('DecodeParms'));
  stream.dict.set(PDFName.of('BitsPerComponent'), PDFNumber.of(8));

  if (settings.grayscale) {
    stream.dict.set(PDFName.of('ColorSpace'), PDFName.of('DeviceGray'));
  }
};

const processImageInStream = async (
  stream: PDFStream,
  pdfDoc: PDFDocument,
  settings: SmartCompressionSettings
): Promise<void> => {
  const imageBytes = stream.getContents();
  if (imageBytes.length < settings.skipSize) {
    return;
  }

  const { width, height } = getImageDimensions(stream);
  if (width <= 0 || height <= 0) {
    return;
  }

  const dimensions = calculateNewDimensions(width, height, settings);
  if (!dimensions) {
    return;
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  canvas.width = dimensions.newWidth;
  canvas.height = dimensions.newHeight;

  const img = await loadImageFromBytes(new Uint8Array(imageBytes));
  configureCanvasContext(ctx, settings);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const { bestBytes, bestSize } = compressImageOnCanvas(canvas, settings);

  if (bestSize < imageBytes.length * settings.threshold) {
    updateStreamWithCompressedImage(stream, bestBytes, bestSize, canvas, settings);
  }
};

const processPageImages = async (
  page: ReturnType<PDFDocument['getPages']>[0],
  pdfDoc: PDFDocument,
  settings: SmartCompressionSettings
): Promise<void> => {
  const resources = page.node.Resources();
  if (!resources) {
    return;
  }

  const xobjects = resources.lookup(PDFName.of('XObject'));
  if (!(xobjects instanceof PDFDict)) {
    return;
  }

  for (const [, value] of xobjects.entries()) {
    const stream = pdfDoc.context.lookup(value);
    if (
      !(stream instanceof PDFStream) ||
      stream.dict.get(PDFName.of('Subtype')) !== PDFName.of('Image')
    ) {
      continue;
    }

    try {
      await processImageInStream(stream, pdfDoc, settings);
    } catch (error) {
      console.warn('Skipping an uncompressible image in smart mode:', error);
    }
  }
};

const performSmartCompression = async (
  arrayBuffer: ArrayBuffer,
  settings: SmartCompressionSettings
): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(arrayBuffer, {
    ignoreEncryption: true,
  });

  if (settings.removeMetadata) {
    removePDFMetadata(pdfDoc);
  }

  const pages = pdfDoc.getPages();
  for (const page of pages) {
    await processPageImages(page, pdfDoc, settings);
  }

  const saveOptions = {
    useObjectStreams: settings.useObjectStreams !== false,
    addDefaultPage: false,
    objectsPerTick: settings.objectsPerTick || 50,
  };

  return await pdfDoc.save(saveOptions);
};

const performLegacyCompression = async (
  arrayBuffer: ArrayBuffer,
  settings: LegacyCompressionSettings
): Promise<Uint8Array> => {
  const pdfJsDoc = await loadPDFWithPDFJSFromBuffer(arrayBuffer);
  const newPdfDoc = await PDFDocument.create();

  for (let i = 1; i <= pdfJsDoc.numPages; i++) {
    const page = await pdfJsDoc.getPage(i);
    const viewport = page.getViewport({ scale: settings.scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) continue;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport, canvas: canvas })
      .promise;

    const jpegBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', settings.quality)
    );

    if (!jpegBlob) continue;

    const jpegBytes = await jpegBlob.arrayBuffer();
    const jpegImage = await newPdfDoc.embedJpg(jpegBytes);
    const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
    newPage.drawImage(jpegImage, {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    });
  }
  return await newPdfDoc.save();
};

const getCompressionSettings = (
  level: CompressionLevel
): CompressionSettings => {
  const settings: Record<CompressionLevel, CompressionSettings> = {
    balanced: {
      smart: {
        quality: 0.5,
        threshold: 0.95,
        maxWidth: 1800,
        maxHeight: 1800,
        skipSize: 3000,
      },
      legacy: { scale: 1.5, quality: 0.6 },
    },
    'high-quality': {
      smart: {
        quality: 0.7,
        threshold: 0.98,
        maxWidth: 2500,
        maxHeight: 2500,
        skipSize: 5000,
      },
      legacy: { scale: 2, quality: 0.9 },
    },
    'small-size': {
      smart: {
        quality: 0.3,
        threshold: 0.95,
        maxWidth: 1200,
        maxHeight: 1200,
        skipSize: 2000,
      },
      legacy: { scale: 1.2, quality: 0.4 },
    },
    extreme: {
      smart: {
        quality: 0.1,
        threshold: 0.95,
        maxWidth: 1000,
        maxHeight: 1000,
        skipSize: 1000,
      },
      legacy: { scale: 1, quality: 0.2 },
    },
  };

  return settings[level];
};

export const compressPDF = async (
  file: File,
  level: CompressionLevel,
  algorithm: CompressionAlgorithm,
  onProgress?: (message: string) => void
): Promise<CompressionResult> => {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const settings = getCompressionSettings(level);
  const smartSettings: SmartCompressionSettings = {
    ...settings.smart,
    removeMetadata: true,
  };
  const legacySettings = settings.legacy;

  let resultBytes: Uint8Array;
  let usedMethod: string;

  if (algorithm === 'vector') {
    onProgress?.('Running Vector (Smart) compression...');
    resultBytes = await performSmartCompression(arrayBuffer, smartSettings);
    usedMethod = 'Vector';
  } else if (algorithm === 'photon') {
    onProgress?.('Running Photon (Rasterize) compression...');
    resultBytes = await performLegacyCompression(arrayBuffer, legacySettings);
    usedMethod = 'Photon';
  } else {
    onProgress?.('Running Automatic (Vector first)...');
    const vectorResultBytes = await performSmartCompression(
      arrayBuffer,
      smartSettings
    );

    if (vectorResultBytes.length < file.size) {
      resultBytes = vectorResultBytes;
      usedMethod = 'Vector (Automatic)';
    } else {
      onProgress?.('Running Automatic (Photon fallback)...');
      resultBytes = await performLegacyCompression(arrayBuffer, legacySettings);
      usedMethod = 'Photon (Automatic)';
    }
  }

  const originalSize = file.size;
  const compressedSize = resultBytes.length;
  const savings = originalSize - compressedSize;
  const savingsPercent =
    savings > 0 ? Number.parseFloat(((savings / originalSize) * 100).toFixed(1)) : 0;

  return {
    bytes: resultBytes,
    method: usedMethod,
    originalSize,
    compressedSize,
    savings,
    savingsPercent,
  };
};

export const compressMultiplePDFs = async (
  files: File[],
  level: CompressionLevel,
  algorithm: CompressionAlgorithm,
  onProgress?: (current: number, total: number, fileName: string) => void
): Promise<Array<{ fileName: string; bytes: Uint8Array; result: CompressionResult }>> => {
  const results: Array<{ fileName: string; bytes: Uint8Array; result: CompressionResult }> = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(i + 1, files.length, file.name);

    const result = await compressPDF(file, level, algorithm, (message) => {
      onProgress?.(i + 1, files.length, `${file.name}: ${message}`);
    });

    results.push({
      fileName: file.name,
      bytes: result.bytes,
      result,
    });
  }

  return results;
};

