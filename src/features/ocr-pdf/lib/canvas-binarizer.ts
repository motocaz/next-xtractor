export const binarizeCanvas = (ctx: CanvasRenderingContext2D): void => {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const brightness =
      0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const color = brightness > 128 ? 255 : 0; 
    data[i] = data[i + 1] = data[i + 2] = color;
  }

  ctx.putImageData(imageData, 0, 0);
};

