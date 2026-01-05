'use client';

import Link from 'next/link';
import { ArrowLeft, RotateCcw, RotateCw } from 'lucide-react';
import { useRotatePages } from '../hooks/useRotatePages';
import { FileUploader } from '@/components/FileUploader';
import { PdfFileCard } from '@/components/common/PdfFileCard';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessMessages } from '@/components/common/ProcessMessages';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';
import { Button } from '@/components/ui/button';
import { RotatePageThumbnail } from './RotatePageThumbnail';

export const RotatePagesTool = () => {
  const {
    pdfFile,
    totalPages,
    isLoadingPDF,
    pdfError,
    isProcessing,
    isLoadingThumbnails,
    loadingMessage,
    error,
    success,
    thumbnails,
    rotations,
    loadPDF,
    rotatePage,
    rotateAll,
    resetRotations,
    applyRotations,
    reset,
  } = useRotatePages();

  const canProcess = pdfFile && thumbnails.length > 0 && !isProcessing && !isLoadingPDF && !isLoadingThumbnails;
  const hasRotations = Array.from(rotations.values()).some((rotation) => rotation !== 0);

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
        Rotate PDF Pages
      </h2>
      <p className="mb-6 text-muted-foreground">
        Rotate all or specific pages in a PDF document. Click the rotate button on each page to rotate it 90° clockwise, or use the batch actions to rotate all pages at once.
      </p>

      <div className="mb-4">
        <FileUploader
          accept="application/pdf"
          multiple={false}
          onFilesSelected={async (files) => {
            if (files.length > 0) {
              await loadPDF(files[0]);
            }
          }}
          disabled={isProcessing || isLoadingPDF || isLoadingThumbnails}
        />
      </div>

      {pdfFile && (
        <PdfFileCard
          pdfFile={pdfFile}
          totalPages={totalPages}
          onRemove={reset}
          disabled={isProcessing || isLoadingPDF || isLoadingThumbnails}
          className="mb-6"
        />
      )}

      {pdfError && (
        <div className="mb-6">
          <ProcessMessages success={null} error={pdfError} />
        </div>
      )}

      {thumbnails.length > 0 && (
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Page Thumbnails ({thumbnails.length} pages)
            </h3>
            {hasRotations && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetRotations}
                disabled={isProcessing}
              >
                Reset All Rotations
              </Button>
            )}
          </div>

          <div className="bg-input border border-border rounded-lg p-4 mb-4">
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 text-center">
              BATCH ACTIONS
            </h4>
            <div className="flex justify-center gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex items-center justify-center flex-1"
                onClick={() => rotateAll(-90)}
                disabled={isProcessing || isLoadingThumbnails}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Rotate All Left
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex items-center justify-center flex-1"
                onClick={() => rotateAll(90)}
                disabled={isProcessing || isLoadingThumbnails}
              >
                <RotateCw className="mr-2 h-4 w-4" />
                Rotate All Right
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {thumbnails.map((thumbnail) => {
              const pageIndex = thumbnail.pageNum - 1;
              const rotation = rotations.get(pageIndex) || 0;
              return (
                <RotatePageThumbnail
                  key={thumbnail.pageNum}
                  pageNum={thumbnail.pageNum}
                  thumbnailUrl={thumbnail.imageUrl}
                  rotation={rotation}
                  onRotate={() => rotatePage(pageIndex, 90)}
                  disabled={isProcessing || isLoadingThumbnails}
                />
              );
            })}
          </div>
        </div>
      )}

      {canProcess && (
        <div className="space-y-4">
          <ProcessButton
            onClick={applyRotations}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
            disabled={!canProcess || !hasRotations}
          >
            Save Rotations
          </ProcessButton>

          <ProcessMessages success={success} error={error} />
        </div>
      )}

      <ProcessLoadingModal
        isProcessing={isProcessing || isLoadingPDF || isLoadingThumbnails}
        loadingMessage={loadingMessage}
      />
    </div>
  );
};

