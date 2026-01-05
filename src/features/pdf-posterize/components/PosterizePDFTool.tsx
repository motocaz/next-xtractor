'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePosterizePDF } from '../hooks/usePosterizePDF';
import { FileUploader } from '@/components/FileUploader';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessMessages } from '@/components/common/ProcessMessages';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';
import { PdfFileCard } from '@/components/common/PdfFileCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export const PosterizePDFTool = () => {
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
    canvasRef,
    rows,
    cols,
    pageSize,
    orientation,
    scalingMode,
    overlap,
    overlapUnits,
    pageRange,
    loadPDF,
    resetPDF,
    setRows,
    setCols,
    setPageSize,
    setOrientation,
    setScalingMode,
    setOverlap,
    setOverlapUnits,
    setPageRange,
    changePage,
    posterize,
  } = usePosterizePDF();

  const [rowsInput, setRowsInput] = useState<string>('');
  const [colsInput, setColsInput] = useState<string>('');
  const [overlapInput, setOverlapInput] = useState<string>('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const rowsDisplay = focusedInput === 'rows' ? rowsInput : String(rows);
  const colsDisplay = focusedInput === 'cols' ? colsInput : String(cols);
  const overlapDisplay = focusedInput === 'overlap' ? overlapInput : String(overlap);

  const canProcess = pdfFile !== null && !isProcessing && !isLoadingPDF;
  const canNavigate = pdfFile !== null && !isProcessing && !isLoadingPDF;
  const showOptions = pdfFile !== null;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <Link
        href="/#tools-header"
        className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 font-semibold transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Tools</span>
      </Link>

      <h2 className="text-2xl font-bold text-foreground mb-4">Posterize PDF</h2>
      <p className="mb-6 text-muted-foreground">
        Split pages into multiple smaller sheets to print as a poster. Navigate the preview and see the grid update based on your settings.
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

      {showOptions && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pt-6">
              <CardTitle>
                Page Preview ({currentPageNum} / {totalPages})
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="relative w-full max-w-2xl mx-auto bg-input rounded-lg border-2 border-border flex items-center justify-center p-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
                  onClick={() => changePage(-1)}
                  disabled={currentPageNum <= 1 || !canNavigate}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto rounded-md max-w-full"
                  style={{ maxHeight: '600px' }}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
                  onClick={() => changePage(1)}
                  disabled={currentPageNum >= totalPages || !canNavigate}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pt-6">
              <CardTitle>Grid Layout</CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="posterize-rows">Rows</Label>
                  <Input
                    type="number"
                    id="posterize-rows"
                    value={rowsDisplay}
                    onFocus={() => {
                      setFocusedInput('rows');
                      setRowsInput(String(rows));
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      setRowsInput(value);
                      if (value === '' || value === '-') return;
                      const num = Number.parseInt(value);
                      if (!Number.isNaN(num) && num >= 1) {
                        setRows(num);
                      }
                    }}
                    onBlur={(e) => {
                      setFocusedInput(null);
                      const value = e.target.value;
                      if (value === '' || Number.parseInt(value) < 1) {
                        setRowsInput('');
                      } else {
                        const num = Number.parseInt(value);
                        if (!Number.isNaN(num) && num >= 1) {
                          setRows(num);
                          setRowsInput('');
                        }
                      }
                    }}
                    min={1}
                    disabled={isProcessing}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="posterize-cols">Columns</Label>
                  <Input
                    type="number"
                    id="posterize-cols"
                    value={colsDisplay}
                    onFocus={() => {
                      setFocusedInput('cols');
                      setColsInput(String(cols));
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      setColsInput(value);
                      if (value === '' || value === '-') return;
                      const num = Number.parseInt(value);
                      if (!Number.isNaN(num) && num >= 1) {
                        setCols(num);
                      }
                    }}
                    onBlur={(e) => {
                      setFocusedInput(null);
                      const value = e.target.value;
                      if (value === '' || Number.parseInt(value) < 1) {
                        setColsInput('');
                      } else {
                        const num = Number.parseInt(value);
                        if (!Number.isNaN(num) && num >= 1) {
                          setCols(num);
                          setColsInput('');
                        }
                      }
                    }}
                    min={1}
                    disabled={isProcessing}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pt-6">
              <CardTitle>Output Page Settings</CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="output-page-size">Page Size</Label>
                  <Select
                    value={pageSize}
                    onValueChange={(value) => setPageSize(value as typeof pageSize)}
                    disabled={isProcessing}
                  >
                    <SelectTrigger id="output-page-size" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="Letter">Letter</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                      <SelectItem value="A3">A3</SelectItem>
                      <SelectItem value="A5">A5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="output-orientation">Orientation</Label>
                  <Select
                    value={orientation}
                    onValueChange={(value) => setOrientation(value as typeof orientation)}
                    disabled={isProcessing}
                  >
                    <SelectTrigger id="output-orientation" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Automatic (Recommended)</SelectItem>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pt-6">
              <CardTitle>Advanced Options</CardTitle>
            </CardHeader>
            <CardContent className="pb-6 space-y-4">
              <div className="space-y-2">
                <Label>Content Scaling</Label>
                <RadioGroup
                  value={scalingMode}
                  onValueChange={(value) => setScalingMode(value as typeof scalingMode)}
                  disabled={isProcessing}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <label className="flex-1 flex items-start gap-3 p-4 rounded-md border border-input hover:bg-accent cursor-pointer transition-colors">
                    <RadioGroupItem value="fit" id="scaling-fit" className="mt-1" />
                    <div className="flex-1">
                      <span className="font-semibold text-foreground block mb-1">Fit</span>
                      <p className="text-xs text-muted-foreground">
                        Preserves all content, may add margins.
                      </p>
                    </div>
                  </label>
                  <label className="flex-1 flex items-start gap-3 p-4 rounded-md border border-input hover:bg-accent cursor-pointer transition-colors">
                    <RadioGroupItem value="fill" id="scaling-fill" className="mt-1" />
                    <div className="flex-1">
                      <span className="font-semibold text-foreground block mb-1">Fill (Crop)</span>
                      <p className="text-xs text-muted-foreground">
                        Fills the page, may crop content.
                      </p>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="overlap">Overlap (for assembly)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    id="overlap"
                    value={overlapDisplay}
                    onFocus={() => {
                      setFocusedInput('overlap');
                      setOverlapInput(String(overlap));
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      setOverlapInput(value);
                      if (value === '' || value === '-') return;
                      const num = Number.parseFloat(value);
                      if (!Number.isNaN(num) && num >= 0) {
                        setOverlap(num);
                      }
                    }}
                    onBlur={(e) => {
                      setFocusedInput(null);
                      const value = e.target.value;
                      if (value === '' || Number.parseFloat(value) < 0) {
                        setOverlapInput('');
                      } else {
                        const num = Number.parseFloat(value);
                        if (!Number.isNaN(num) && num >= 0) {
                          setOverlap(num);
                          setOverlapInput('');
                        }
                      }
                    }}
                    min={0}
                    step={0.1}
                    disabled={isProcessing}
                    className="flex-1"
                  />
                  <Select
                    value={overlapUnits}
                    onValueChange={(value) => setOverlapUnits(value as typeof overlapUnits)}
                    disabled={isProcessing}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">Points</SelectItem>
                      <SelectItem value="in">Inches</SelectItem>
                      <SelectItem value="mm">mm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="page-range">Page Range (optional)</Label>
                <Input
                  type="text"
                  id="page-range"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder="e.g., 1-3, 5"
                  disabled={isProcessing}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Total pages: <span className="font-medium">{totalPages}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showOptions && (
        <div className="mt-6">
          <ProcessButton
            onClick={posterize}
            disabled={!canProcess}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
          >
            Posterize PDF
          </ProcessButton>
        </div>
      )}

      <div className="mt-4">
        <ProcessMessages success={success} error={error || pdfError} />
      </div>

      <ProcessLoadingModal isProcessing={isProcessing} loadingMessage={loadingMessage} />
    </div>
  );
};

