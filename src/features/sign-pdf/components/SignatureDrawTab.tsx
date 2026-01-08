"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { setupDrawingCanvas } from "../lib/signature-canvas";

interface SignatureDrawTabProps {
  onSave: (imageDataUrl: string) => void;
  disabled?: boolean;
}

export const SignatureDrawTab = ({
  onSave,
  disabled,
}: SignatureDrawTabProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorPickerRef = useRef<HTMLInputElement>(null);
  const [, setIsDrawing] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !colorPickerRef.current || disabled) return;

    const cleanup = setupDrawingCanvas(
      canvasRef.current,
      canvasRef.current.getContext("2d")!,
      colorPickerRef.current,
      setIsDrawing,
      () => {},
      () => {},
    );

    cleanupRef.current = cleanup;

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [disabled]);

  const handleClear = () => {
    if (!canvasRef.current) return;
    const context = canvasRef.current.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL();
    onSave(dataUrl);
    handleClear();
  };

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        className="bg-white rounded-md cursor-crosshair w-full border border-border"
        height={150}
      />
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="signature-color" className="text-sm font-medium">
            Color:
          </Label>
          <input
            ref={colorPickerRef}
            type="color"
            id="signature-color"
            defaultValue="#000000"
            className="w-10 h-10 bg-input border border-border rounded-lg p-1 cursor-pointer"
            disabled={disabled}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={disabled}
            className="grow sm:grow-0"
          >
            Clear
          </Button>
          <Button
            onClick={handleSave}
            disabled={disabled}
            className="grow sm:grow-0"
          >
            Save Signature
          </Button>
        </div>
      </div>
    </div>
  );
};
