'use client';

import Link from 'next/link';
import { useRef, useEffect } from 'react';
import { useChangeTextColor } from '../hooks/useChangeTextColor';
import { PDFUploadSection } from '@/components/common/PDFUploadSection';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessMessages } from '@/components/common/ProcessMessages';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { updateTextColorPreview } from '../lib/change-text-color-logic';

export const ChangeTextColorTool = () => {
  const {
    pdfFile,
    colorHex,
    isProcessing,
    loadingMessage,
    error,
    success,
    isLoadingPDF,
    pdfError,
    setColorHex,
    loadPDF,
    processTextColor,
    reset,
  } = useChangeTextColor();

  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRenderingPreviewRef = useRef(false);

  useEffect(() => {
    const originalCanvas = originalCanvasRef.current;
    const previewCanvas = previewCanvasRef.current;

    if (!pdfFile || !originalCanvas || !previewCanvas) {
      return;
    }

    if (isRenderingPreviewRef.current) {
      return;
    }

    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }

    previewTimeoutRef.current = setTimeout(async () => {
      if (isRenderingPreviewRef.current) return;
      isRenderingPreviewRef.current = true;

      try {
        await updateTextColorPreview(
          pdfFile,
          colorHex,
          originalCanvas,
          previewCanvas
        );
      } catch (err) {
        console.error('Error updating preview:', err);
      } finally {
        isRenderingPreviewRef.current = false;
      }
    }, 250);

    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, [pdfFile, colorHex]);

  const showOptions = pdfFile !== null && !isLoadingPDF && !pdfError;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <Link
        href="/#tools-header"
        className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 font-semibold transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Tools</span>
      </Link>

      <h2 className="text-2xl font-bold text-foreground mb-4">
        Change Text Color
      </h2>
      <p className="mb-6 text-muted-foreground">
        Change the color of dark text in your PDF. This process converts pages
        to images, so text will not be selectable in the final file.
      </p>

      <PDFUploadSection
        pdfFile={pdfFile}
        isLoadingPDF={isLoadingPDF}
        pdfError={pdfError}
        loadPDF={loadPDF}
        reset={reset}
        disabled={isProcessing}
      />

      {showOptions && (
        <div id="text-color-options" className="mt-6 space-y-4">
          <div>
            <Label htmlFor="text-color-input">Select Text Color</Label>
            <Input
              type="color"
              id="text-color-input"
              value={colorHex}
              onChange={(e) => setColorHex(e.target.value)}
              className="w-full h-[42px] mt-2 cursor-pointer"
              disabled={isProcessing}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center">
              <h3 className="font-semibold text-foreground mb-2">Original</h3>
              <canvas
                ref={originalCanvasRef}
                id="original-canvas"
                className="w-full h-auto rounded-lg border-2 border-border"
              />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-foreground mb-2">Preview</h3>
              <canvas
                ref={previewCanvasRef}
                id="text-color-canvas"
                className="w-full h-auto rounded-lg border-2 border-border"
              />
            </div>
          </div>

          <ProcessButton
            onClick={processTextColor}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
          >
            Apply Color & Download
          </ProcessButton>

          <ProcessMessages success={success} error={error} />
        </div>
      )}

      <ProcessLoadingModal
        isProcessing={isProcessing}
        loadingMessage={loadingMessage}
      />
    </div>
  );
};

