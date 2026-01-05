"use client";

export const encodeBMP = (imageData: ImageData): ArrayBuffer => {
  const { width, height, data } = imageData;
  const stride = Math.floor((24 * width + 31) / 32) * 4;
  const fileSize = stride * height + 54;
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  view.setUint16(0, 0x4d42, true);
  view.setUint32(2, fileSize, true);
  view.setUint32(10, 54, true);

  view.setUint32(14, 40, true);
  view.setUint32(18, width, true);
  view.setUint32(22, -height, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(30, 0, true);
  view.setUint32(34, stride * height, true);
  view.setUint32(38, 2835, true);
  view.setUint32(42, 2835, true);

  let offset = 54;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      view.setUint8(offset++, data[i + 2]);
      view.setUint8(offset++, data[i + 1]);
      view.setUint8(offset++, data[i]);
    }
    for (let p = 0; p < stride - width * 3; p++) {
      view.setUint8(offset++, 0);
    }
  }
  return buffer;
};
