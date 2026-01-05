'use client';

import UTIF from 'utif';

export const decodeTiffToImageData = async (
  tiffBytes: ArrayBuffer
): Promise<ImageData[]> => {
  const ifds = UTIF.decode(tiffBytes);
  
  if (!ifds || ifds.length === 0) {
    throw new Error('No valid IFDs found in TIFF file.');
  }

  const imageDataArray: ImageData[] = [];

  for (const ifd of ifds) {
    UTIF.decodeImage(tiffBytes, ifd);
    
    const width = ifd.width;
    const height = ifd.height;
    
    if (!width || !height || width <= 0 || height <= 0) {
      throw new Error('Invalid TIFF dimensions.');
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    const imageData = ctx.createImageData(width, height);
    const pixels = imageData.data;

    if (!ifd.data || ifd.data.length === 0) {
      throw new Error('TIFF IFD has no image data after decoding.');
    }

    const totalPixels = width * height;
    const dataLength = ifd.data.length;
    const samplesPerPixel = dataLength / totalPixels;

    if (
      samplesPerPixel !== 1 &&
      samplesPerPixel !== 3 &&
      samplesPerPixel !== 4
    ) {
      throw new Error(
        `Unsupported TIFF format: ${samplesPerPixel} samples per pixel. Expected 1 (grayscale), 3 (RGB), or 4 (RGBA).`
      );
    }

    for (let i = 0; i < totalPixels; i++) {
      const dstIndex = i * 4;

      if (samplesPerPixel === 1) {
        const gray = ifd.data[i];
        pixels[dstIndex] = gray;
        pixels[dstIndex + 1] = gray;
        pixels[dstIndex + 2] = gray;
        pixels[dstIndex + 3] = 255;
      } else if (samplesPerPixel === 3) {
        const srcIndex = i * 3;
        pixels[dstIndex] = ifd.data[srcIndex];
        pixels[dstIndex + 1] = ifd.data[srcIndex + 1];
        pixels[dstIndex + 2] = ifd.data[srcIndex + 2];
        pixels[dstIndex + 3] = 255;
      } else if (samplesPerPixel === 4) {
        const srcIndex = i * 4;
        pixels[dstIndex] = ifd.data[srcIndex];
        pixels[dstIndex + 1] = ifd.data[srcIndex + 1];
        pixels[dstIndex + 2] = ifd.data[srcIndex + 2];
        pixels[dstIndex + 3] = ifd.data[srcIndex + 3];
      }
    }

    imageDataArray.push(imageData);
  }

  return imageDataArray;
};

export const imageDataToPngBytes = async (
  imageData: ImageData
): Promise<ArrayBuffer> => {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.putImageData(imageData, 0, 0);

  const pngBlob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png')
  );

  if (!pngBlob) {
    throw new Error('Failed to convert ImageData to PNG');
  }

  return pngBlob.arrayBuffer();
};

