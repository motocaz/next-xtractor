'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRemoveBlankPages } from '../hooks/useRemoveBlankPages';
import { PDFUploadSection } from '@/components/common/PDFUploadSection';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessMessages } from '@/components/common/ProcessMessages';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

export const RemoveBlankPagesTool = () => {
  const {
    sensitivity,
    analysisResult,
    isAnalyzing,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    setSensitivity,
    removeBlankPages,
    loadPDF,
    reset,
  } = useRemoveBlankPages();

  const showOptions = pdfDoc !== null && !isLoadingPDF && !pdfError;
  const canProcess =
    pdfDoc !== null &&
    analysisResult !== null &&
    analysisResult.pagesToRemove.length > 0 &&
    !isProcessing;

  const handleSensitivityChange = (values: number[]) => {
    setSensitivity(values[0]);
  };

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
        Remove Blank Pages
      </h2>
      <p className="mb-6 text-muted-foreground">
        Automatically detect and remove blank or nearly blank pages from your
        PDF. Adjust the sensitivity to control what is considered &quot;blank&quot;.
      </p>

      <PDFUploadSection
        pdfFile={pdfFile}
        pdfDoc={pdfDoc}
        isLoadingPDF={isLoadingPDF}
        pdfError={pdfError}
        loadPDF={loadPDF}
        reset={reset}
        disabled={isProcessing || isAnalyzing}
      />

      {showOptions && (
        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Sensitivity
            </h3>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sensitivity-slider">
                      Sensitivity: <span className="font-semibold">{sensitivity}%</span>
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {sensitivity}%
                    </span>
                  </div>
                  <Slider
                    id="sensitivity-slider"
                    min={80}
                    max={100}
                    value={[sensitivity]}
                    onValueChange={handleSensitivityChange}
                    disabled={isProcessing || isAnalyzing}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher sensitivity requires pages to be more &quot;blank&quot; to be
                    removed. Lower values are more aggressive.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {isAnalyzing && (
            <div className="p-4 bg-input border border-border rounded-lg">
              <p className="text-sm text-muted-foreground">
                Analyzing pages for blank detection...
              </p>
            </div>
          )}

          {analysisResult && !isAnalyzing && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Analysis Results
              </h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <p className="text-foreground">{analysisResult.message}</p>

                    {analysisResult.pagesToRemove.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-3">
                          Pages to be removed:
                        </p>
                        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                          {analysisResult.analysisData
                            .filter((page) => page.isBlank)
                            .map((page) => (
                              <div
                                key={page.pageNum}
                                className="relative aspect-3/4 rounded border border-border overflow-hidden bg-muted"
                                title={`Page ${page.pageNum}`}
                              >
                                {page.thumbnailUrl ? (
                                  <Image
                                    src={page.thumbnailUrl}
                                    alt={`Page ${page.pageNum}`}
                                    fill
                                    className="object-contain"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                    {page.pageNum}
                                  </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs text-center py-0.5">
                                  {page.pageNum}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <ProcessButton
            onClick={removeBlankPages}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
            disabled={!canProcess}
          >
            Remove Blank Pages & Download
          </ProcessButton>

          <ProcessMessages success={success} error={error} />
        </div>
      )}

      <ProcessLoadingModal
        isProcessing={isProcessing || isAnalyzing}
        loadingMessage={loadingMessage || (isAnalyzing ? 'Analyzing pages...' : null)}
      />
    </div>
  );
};

