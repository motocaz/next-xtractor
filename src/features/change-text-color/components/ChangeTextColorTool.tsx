'use client';

import Link from 'next/link';
import { useRef, useEffect } from 'react';
import { useChangeTextColor } from '../hooks/useChangeTextColor';
import { FileUploader } from '@/components/FileUploader';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessMessages } from '@/components/common/ProcessMessages';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { CheckCircle2, AlertCircle, ArrowLeft, X } from 'lucide-react';
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

      <div className="mb-4">
        <FileUploader
          accept="application/pdf"
          multiple={false}
          onFilesSelected={async (files) => {
            if (files[0]) {
              await loadPDF(files[0]);
            }
          }}
          disabled={isLoadingPDF || isProcessing}
        />
      </div>

      <div id="file-display-area" className="mt-4 space-y-2">
        {isLoadingPDF && (
          <div className="flex items-center gap-2 p-2 bg-input rounded-md">
            <Spinner size="sm" />
            <span className="text-sm text-muted-foreground">Loading PDF...</span>
          </div>
        )}

        {pdfError && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span className="text-sm text-destructive">{pdfError}</span>
          </div>
        )}

        {pdfFile && !pdfError && (
          <div className="flex items-center justify-between gap-2 p-2 bg-input rounded-md">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm text-foreground truncate">
                {pdfFile.name}
              </span>
            </div>
            <button
              onClick={reset}
              className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
              aria-label="Remove PDF"
              title="Remove PDF"
              disabled={isProcessing}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

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

