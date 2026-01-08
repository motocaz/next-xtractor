import type { PlacedSignature, ResizeHandle } from "../types";

export const getMousePos = (
  canvas: HTMLCanvasElement,
  evt: MouseEvent | TouchEvent,
): { x: number; y: number } => {
  const rect = canvas.getBoundingClientRect();
  const clientX =
    "touches" in evt ? (evt.touches[0]?.clientX ?? 0) : evt.clientX;
  const clientY =
    "touches" in evt ? (evt.touches[0]?.clientY ?? 0) : evt.clientY;
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
};

export const getResizeHandles = (
  sig: PlacedSignature,
): Record<ResizeHandle, { x: number; y: number }> => {
  return {
    "top-left": { x: sig.x, y: sig.y },
    "top-middle": { x: sig.x + sig.width / 2, y: sig.y },
    "top-right": { x: sig.x + sig.width, y: sig.y },
    "middle-left": { x: sig.x, y: sig.y + sig.height / 2 },
    "middle-right": { x: sig.x + sig.width, y: sig.y + sig.height / 2 },
    "bottom-left": { x: sig.x, y: sig.y + sig.height },
    "bottom-middle": { x: sig.x + sig.width / 2, y: sig.y + sig.height },
    "bottom-right": { x: sig.x + sig.width, y: sig.y + sig.height },
  };
};

export const getHandleAtPos = (
  pos: { x: number; y: number },
  sig: PlacedSignature,
): ResizeHandle | null => {
  const handles = getResizeHandles(sig);
  const handleSize = 6;
  for (const [name, handlePos] of Object.entries(handles)) {
    if (
      Math.abs(pos.x - handlePos.x) < handleSize &&
      Math.abs(pos.y - handlePos.y) < handleSize
    ) {
      return name as ResizeHandle;
    }
  }
  return null;
};

export const setupDrawingCanvas = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  colorPicker: HTMLInputElement,
  onDrawingChange: (isDrawing: boolean) => void,
  onDraw: (pos: { x: number; y: number }) => void,
  onStop: () => void,
): (() => void) => {
  const rect = canvas.getBoundingClientRect();
  const dpi = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpi;
  canvas.height = rect.height * dpi;
  context.scale(dpi, dpi);
  context.lineWidth = 2;
  context.strokeStyle = colorPicker.value;

  let isDrawing = false;

  const handleColorChange = () => {
    context.strokeStyle = colorPicker.value;
  };

  colorPicker.addEventListener("input", handleColorChange);

  const start = (e: MouseEvent | TouchEvent) => {
    isDrawing = true;
    onDrawingChange(true);
    const pos = getMousePos(canvas, e);
    context.beginPath();
    context.moveTo(pos.x, pos.y);
  };

  const draw = (e: MouseEvent | TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getMousePos(canvas, e);
    context.lineTo(pos.x, pos.y);
    context.stroke();
    onDraw(pos);
  };

  const stop = () => {
    isDrawing = false;
    onDrawingChange(false);
    onStop();
  };

  const events = {
    start: ["mousedown", "touchstart"] as const,
    move: ["mousemove", "touchmove"] as const,
    end: ["mouseup", "mouseleave", "touchend"] as const,
  };

  events.start.forEach((evt) =>
    canvas.addEventListener(evt, start as EventListener, { passive: false }),
  );
  events.move.forEach((evt) =>
    canvas.addEventListener(evt, draw as EventListener, { passive: false }),
  );
  events.end.forEach((evt) =>
    canvas.addEventListener(evt, stop as EventListener),
  );

  return () => {
    colorPicker.removeEventListener("input", handleColorChange);
    events.start.forEach((evt) =>
      canvas.removeEventListener(evt, start as EventListener),
    );
    events.move.forEach((evt) =>
      canvas.removeEventListener(evt, draw as EventListener),
    );
    events.end.forEach((evt) =>
      canvas.removeEventListener(evt, stop as EventListener),
    );
  };
};
