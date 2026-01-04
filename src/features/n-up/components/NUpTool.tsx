'use client';

import Link from 'next/link';
import { useNUp } from '../hooks/useNUp';
import { PDFUploadSection } from '@/components/common/PDFUploadSection';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessMessages } from '@/components/common/ProcessMessages';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export const NUpTool = () => {
  const {
    pagesPerSheet,
    pageSize,
    orientation,
    useMargins,
    addBorder,
    borderColor,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    setPagesPerSheet,
    setPageSize,
    setOrientation,
    setUseMargins,
    setAddBorder,
    setBorderColor,
    loadPDF,
    processNUp,
    reset,
  } = useNUp();

  const showOptions = pdfDoc !== null && !isLoadingPDF && !pdfError;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <Link
        href="/#tools-header"
        className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 font-semibold transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Tools</span>
      </Link>

      <h2 className="text-2xl font-bold text-foreground mb-4">N-Up Page Arrangement</h2>
      <p className="mb-6 text-muted-foreground">
        Combine multiple pages from your PDF onto a single sheet. This is great for creating
        booklets or proof sheets.
      </p>

      <PDFUploadSection
        pdfFile={pdfFile}
        pdfDoc={pdfDoc}
        isLoadingPDF={isLoadingPDF}
        pdfError={pdfError}
        loadPDF={loadPDF}
        reset={reset}
        disabled={isProcessing}
      />

      {showOptions && (
        <div className="mt-6 space-y-4">
          <Card>
            <CardContent className="pt-6 pb-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pages-per-sheet">Pages Per Sheet</Label>
                  <Select
                    value={pagesPerSheet.toString()}
                    onValueChange={(value) => setPagesPerSheet(Number.parseInt(value) as 2 | 4 | 9 | 16)}
                    disabled={isProcessing}
                  >
                    <SelectTrigger id="pages-per-sheet" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2-Up</SelectItem>
                      <SelectItem value="4">4-Up (2x2)</SelectItem>
                      <SelectItem value="9">9-Up (3x3)</SelectItem>
                      <SelectItem value="16">16-Up (4x4)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="output-page-size">Output Page Size</Label>
                  <Select
                    value={pageSize}
                    onValueChange={(value) => setPageSize(value as 'Letter' | 'Legal' | 'Tabloid' | 'A4' | 'A3')}
                    disabled={isProcessing}
                  >
                    <SelectTrigger id="output-page-size" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Letter">Letter (8.5 x 11 in)</SelectItem>
                      <SelectItem value="Legal">Legal (8.5 x 14 in)</SelectItem>
                      <SelectItem value="Tabloid">Tabloid (11 x 17 in)</SelectItem>
                      <SelectItem value="A4">A4 (210 x 297 mm)</SelectItem>
                      <SelectItem value="A3">A3 (297 x 420 mm)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="output-orientation">Output Orientation</Label>
                  <Select
                    value={orientation}
                    onValueChange={(value) => setOrientation(value as 'auto' | 'portrait' | 'landscape')}
                    disabled={isProcessing}
                  >
                    <SelectTrigger id="output-orientation" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Automatic</SelectItem>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end pb-1">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="add-margins"
                      checked={useMargins}
                      onCheckedChange={(checked) => setUseMargins(checked === true)}
                      disabled={isProcessing}
                    />
                    <Label
                      htmlFor="add-margins"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Add Margins & Gutters
                    </Label>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="add-border"
                      checked={addBorder}
                      onCheckedChange={(checked) => setAddBorder(checked === true)}
                      disabled={isProcessing}
                    />
                    <Label
                      htmlFor="add-border"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Draw Border Around Each Page
                    </Label>
                  </div>
                </div>

                {addBorder && (
                  <div className="space-y-2">
                    <Label htmlFor="border-color">Border Color</Label>
                    <Input
                      type="color"
                      id="border-color"
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="h-[42px] p-1 cursor-pointer"
                      disabled={isProcessing}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="text-xs text-muted-foreground">
            Total pages: <span>{totalPages}</span>
          </div>

          <ProcessButton
            onClick={processNUp}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
          >
            Create N-Up PDF
          </ProcessButton>

          <ProcessMessages success={success} error={error} />
        </div>
      )}

      <ProcessLoadingModal isProcessing={isProcessing} loadingMessage={loadingMessage} />
    </div>
  );
};

