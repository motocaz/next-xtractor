'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useRedactPDF } from '../hooks/useRedactPDF';
import { FileUploader } from '@/components/FileUploader';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessMessages } from '@/components/common/ProcessMessages';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';
import { PdfFileCard } from '@/components/common/PdfFileCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { RedactionRect } from '../types';

export const RedactPDFTool = () => {
  const {
    pdfFile,
    isLoadingPDF,
    pdfError,
    isProcessing,
    loadingMessage,
    error,
    success,
    totalPages,
    currentPageNum,
    pageRedactions,
    currentPageImageUrl,
    loadPDF,
    resetPDF,
    changePage,
    addRedaction,
    removeRedaction,
    clearPageRedactions,
    clearAllRedactions,
    applyRedactions,
  } = useRedactPDF();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const currentRectRef = useRef<RedactionRect | null>(null);

  const drawRedactionRect = (
    ctx: CanvasRenderingContext2D,
    rect: RedactionRect,
    isDrawing: boolean
  ) => {
    ctx.fillStyle = isDrawing
      ? 'rgba(0, 0, 0, 0.5)'
      : 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

    ctx.strokeStyle = isDrawing ? '#ef4444' : '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
  };

  useEffect(() => {
    if (!currentPageImageUrl || !canvasRef.current || !containerRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const currentRedactions = pageRedactions[currentPageNum] || [];
      currentRedactions.forEach((rect) => {
        drawRedactionRect(ctx, rect, false);
      });

      imageRef.current = img;
    };
    img.src = currentPageImageUrl;
  }, [currentPageImageUrl, currentPageNum, pageRedactions]);

  useEffect(() => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0);

    const currentRedactions = pageRedactions[currentPageNum] || [];
    currentRedactions.forEach((rect) => {
      drawRedactionRect(ctx, rect, false);
    });

    if (currentRectRef.current) {
      drawRedactionRect(ctx, currentRectRef.current, true);
    }
  }, [pageRedactions, currentPageNum]);

  const getEventCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return null;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = 'touches' in e ? e.touches[0] : e;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isProcessing || isLoadingPDF) return;
    e.preventDefault();

    const coords = getEventCoordinates(e);
    if (!coords) return;

    isDrawingRef.current = true;
    startPosRef.current = coords;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !startPosRef.current || !canvasRef.current) return;
    e.preventDefault();

    const coords = getEventCoordinates(e);
    if (!coords) return;

    const x = Math.min(startPosRef.current.x, coords.x);
    const y = Math.min(startPosRef.current.y, coords.y);
    const width = Math.abs(startPosRef.current.x - coords.x);
    const height = Math.abs(startPosRef.current.y - coords.y);

    currentRectRef.current = { x, y, width, height };

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx || !imageRef.current) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(imageRef.current, 0, 0);

    const currentRedactions = pageRedactions[currentPageNum] || [];
    currentRedactions.forEach((rect) => {
      drawRedactionRect(ctx, rect, false);
    });

    if (width > 5 && height > 5) {
      drawRedactionRect(ctx, currentRectRef.current, true);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawingRef.current || !startPosRef.current || !currentRectRef.current) {
      isDrawingRef.current = false;
      startPosRef.current = null;
      currentRectRef.current = null;
      return;
    }

    const rect = currentRectRef.current;
    
    if (rect.width > 5 && rect.height > 5) {
      addRedaction(rect);
    }

    isDrawingRef.current = false;
    startPosRef.current = null;
    currentRectRef.current = null;
  };

  const handleMouseLeave = () => {
    handleMouseUp();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isProcessing || isLoadingPDF) return;
    e.preventDefault();
    handleMouseDown(e as unknown as React.MouseEvent<HTMLCanvasElement>);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    handleMouseMove(e as unknown as React.MouseEvent<HTMLCanvasElement>);
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  const handlePrevPage = async () => {
    await changePage(-1);
  };

  const handleNextPage = async () => {
    await changePage(1);
  };

  const handleApplyRedactions = async () => {
    await applyRedactions();
  };

  const currentRedactions = pageRedactions[currentPageNum] || [];
  const totalRedactions = Object.values(pageRedactions).reduce(
    (sum, redactions) => sum + redactions.length,
    0
  );

  const canProcess = pdfFile !== null && !isProcessing && !isLoadingPDF && totalRedactions > 0;
  const canNavigate = pdfFile !== null && !isProcessing && !isLoadingPDF;
  const canDraw = pdfFile !== null && !isProcessing && !isLoadingPDF;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <Link
        href="/#tools-header"
        className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 font-semibold transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Tools</span>
      </Link>

      <h2 className="text-2xl font-bold text-foreground mb-4">Redact PDF</h2>
      <p className="mb-6 text-muted-foreground">
        Permanently black out sensitive content from your PDFs. Draw rectangles over content you want to redact.
      </p>

      {!pdfFile && (
        <div className="mb-4">
          <FileUploader
            accept="application/pdf"
            multiple={false}
            onFilesSelected={async (files) => {
              if (files.length > 0) {
                await loadPDF(files[0]);
              }
            }}
            disabled={isProcessing || isLoadingPDF}
          />
        </div>
      )}

      {pdfError && (
        <div className="mb-4">
          <ProcessMessages error={pdfError} success={null} />
        </div>
      )}

      {pdfFile && (
        <div className="mb-4">
          <PdfFileCard
            pdfFile={pdfFile}
            totalPages={totalPages}
            onRemove={resetPDF}
            disabled={isProcessing}
          />
        </div>
      )}

      {pdfFile && (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 pb-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  How it works:
                </h3>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                  <li>
                    <strong className="text-foreground">Draw Rectangles:</strong>{' '}
                    Click and drag on the page to draw redaction rectangles over sensitive content.
                  </li>
                  <li>
                    <strong className="text-foreground">Multiple Redactions:</strong>{' '}
                    You can draw multiple rectangles on each page.
                  </li>
                  <li>
                    <strong className="text-foreground">Permanent:</strong>{' '}
                    Redacted content is permanently blacked out and cannot be recovered.
                  </li>
                  <li>
                    <strong className="text-foreground">Navigate Pages:</strong>{' '}
                    Use the page navigation buttons to move between pages and add redactions to each page.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row items-center justify-between flex-wrap gap-4 p-3 bg-input rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevPage}
                disabled={!canNavigate || currentPageNum <= 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-foreground font-medium whitespace-nowrap">
                Page {currentPageNum} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextPage}
                disabled={!canNavigate || currentPageNum >= totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {currentRedactions.length} redaction{currentRedactions.length === 1 ? '' : 's'} on this page
              </span>
              {currentRedactions.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearPageRedactions(currentPageNum)}
                  disabled={isProcessing}
                  className="h-8"
                >
                  Clear Page
                </Button>
              )}
            </div>
          </div>

          <div
            ref={containerRef}
            className="w-full relative overflow-hidden bg-background rounded-lg border border-border flex items-center justify-center"
            style={{ minHeight: '500px' }}
          >
            {currentPageImageUrl ? (
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto cursor-crosshair"
                onMouseDown={canDraw ? handleMouseDown : undefined}
                onMouseMove={canDraw ? handleMouseMove : undefined}
                onMouseUp={canDraw ? handleMouseUp : undefined}
                onMouseLeave={canDraw ? handleMouseLeave : undefined}
                onTouchStart={canDraw ? handleTouchStart : undefined}
                onTouchMove={canDraw ? handleTouchMove : undefined}
                onTouchEnd={canDraw ? handleTouchEnd : undefined}
                style={{ touchAction: 'none' }}
              />
            ) : (
              <div className="p-8 text-muted-foreground">Loading page...</div>
            )}
          </div>

          {currentRedactions.length > 0 && (
            <Card>
              <CardContent className="pt-6 pb-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Redactions on this page:
                </h3>
                <div className="space-y-2">
                  {currentRedactions.map((rect, index) => (
                    <div
                      key={`${index}-${rect.height}-${rect.width}-${rect.x}-${rect.y}`}
                      className="flex items-center justify-between p-2 bg-input rounded border border-border"
                    >
                      <span className="text-sm text-muted-foreground">
                        Redaction {index + 1} ({Math.round(rect.width)} × {Math.round(rect.height)} px)
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRedaction(currentPageNum, index)}
                        disabled={isProcessing}
                        className="h-8 w-8"
                        aria-label={`Remove redaction ${index + 1}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <ProcessButton
              onClick={handleApplyRedactions}
              isProcessing={isProcessing}
              loadingMessage={loadingMessage}
              disabled={!canProcess}
            >
              Apply Redactions & Download
            </ProcessButton>

            {totalRedactions > 0 && (
              <Button
                variant="outline"
                onClick={clearAllRedactions}
                disabled={isProcessing}
              >
                Clear All Redactions ({totalRedactions})
              </Button>
            )}
          </div>

          <ProcessMessages success={success} error={error} />

          {pdfFile && (
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={resetPDF}
                disabled={isProcessing}
              >
                Reset & Upload New PDF
              </Button>
            </div>
          )}
        </div>
      )}

      <ProcessLoadingModal
        isProcessing={isProcessing}
        loadingMessage={loadingMessage}
      />
    </div>
  );
};

