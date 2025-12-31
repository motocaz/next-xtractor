'use client';

import Link from 'next/link';
import { useAddWatermark } from '../hooks/useAddWatermark';
import { FileUploader } from '@/components/FileUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, ArrowLeft, X } from 'lucide-react';

export const AddWatermarkTool = () => {
  const {
    watermarkType,
    text,
    fontSize,
    textColor,
    opacityText,
    angleText,
    imageFile,
    opacityImage,
    angleImage,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    setWatermarkType,
    setText,
    setFontSize,
    setTextColor,
    setOpacityText,
    setAngleText,
    setImageFile,
    setOpacityImage,
    setAngleImage,
    loadPDF,
    processWatermark,
    reset,
  } = useAddWatermark();

  const showWatermarkOptions = pdfDoc !== null && !isLoadingPDF && !pdfError;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
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
        Add Watermark
      </h2>
      <p className="mb-6 text-muted-foreground">
        Apply a text or image watermark to every page of your PDF document.
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
            <span className="text-sm text-muted-foreground">
              Loading PDF...
            </span>
          </div>
        )}

        {pdfError && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span className="text-sm text-destructive">{pdfError}</span>
          </div>
        )}

        {pdfFile && pdfDoc && !pdfError && (
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
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {showWatermarkOptions && (
        <div id="watermark-options" className="mt-6 space-y-4">
          <Card>
            <CardContent className="p-2">
              <RadioGroup
                value={watermarkType}
                onValueChange={(value) => setWatermarkType(value as 'text' | 'image')}
                className="flex gap-4"
              >
                <div className="flex-1">
                  <Label
                    htmlFor="watermark-type-text"
                    className={`flex items-center justify-center gap-2 p-3 rounded-md hover:bg-accent cursor-pointer transition-colors ${
                      watermarkType === 'text'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-transparent'
                    }`}
                  >
                    <RadioGroupItem value="text" id="watermark-type-text" className="sr-only" />
                    <span className="font-semibold">Text</span>
                  </Label>
                </div>
                <div className="flex-1">
                  <Label
                    htmlFor="watermark-type-image"
                    className={`flex items-center justify-center gap-2 p-3 rounded-md hover:bg-accent cursor-pointer transition-colors ${
                      watermarkType === 'image'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-transparent'
                    }`}
                  >
                    <RadioGroupItem value="image" id="watermark-type-image" className="sr-only" />
                    <span className="font-semibold">Image</span>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {watermarkType === 'text' && (
            <Card>
              <CardContent className="pt-6 pb-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="watermark-text">Watermark Text</Label>
                    <Input
                      type="text"
                      id="watermark-text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="e.g., CONFIDENTIAL"
                      className="bg-background! dark:bg-card!"
                      disabled={isProcessing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="font-size">Font Size</Label>
                    <Input
                      type="number"
                      id="font-size"
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                      min="1"
                      className="bg-background! dark:bg-card!"
                      disabled={isProcessing}
                    />
                  </div>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label htmlFor="text-color">Text Color</Label>
                     <Input
                       type="color"
                       id="text-color"
                       value={textColor}
                       onChange={(e) => setTextColor(e.target.value)}
                       className="h-[42px] p-1 cursor-pointer bg-background! dark:bg-card!"
                       disabled={isProcessing}
                     />
                   </div>
                   <div className="space-y-2 flex flex-col justify-center">
                     <Label htmlFor="opacity-text">
                       Opacity (<span id="opacity-value-text">{opacityText}</span>)
                     </Label>
                     <Slider
                       id="opacity-text"
                       value={[parseFloat(opacityText)]}
                       onValueChange={(values) => setOpacityText(values[0].toString())}
                       min={0}
                       max={1}
                       step={0.1}
                       disabled={isProcessing}
                       className="mt-2"
                     />
                   </div>
                 </div>
                <div className="space-y-2">
                  <Label htmlFor="angle-text">
                    Angle (<span id="angle-value-text">{angleText}</span>°)
                  </Label>
                  <Slider
                    id="angle-text"
                    value={[Number.parseInt(angleText, 10)]}
                    onValueChange={(values) => setAngleText(values[0].toString())}
                    min={-180}
                    max={180}
                    step={1}
                    disabled={isProcessing}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {watermarkType === 'image' && (
            <Card>
              <CardContent className="pt-6 pb-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image-watermark-input">Upload Watermark Image</Label>
                  <Input
                    type="file"
                    id="image-watermark-input"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleImageFileChange}
                    className="bg-background! dark:bg-card! h-full"
                    disabled={isProcessing}
                  />
                  {imageFile && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Selected: {imageFile.name}
                    </p>
                  )}
                </div>
                 <div className="space-y-2 flex flex-col justify-center">
                   <Label htmlFor="opacity-image">
                     Opacity (<span id="opacity-value-image">{opacityImage}</span>)
                   </Label>
                   <Slider
                     id="opacity-image"
                     value={[parseFloat(opacityImage)]}
                     onValueChange={(values) => setOpacityImage(values[0].toString())}
                     min={0}
                     max={1}
                     step={0.1}
                     disabled={isProcessing}
                     className="mt-2"
                   />
                 </div>
                <div className="space-y-2">
                  <Label htmlFor="angle-image">
                    Angle (<span id="angle-value-image">{angleImage}</span>°)
                  </Label>
                  <Slider
                    id="angle-image"
                    value={[Number.parseInt(angleImage, 10)]}
                    onValueChange={(values) => setAngleImage(values[0].toString())}
                    min={-180}
                    max={180}
                    step={1}
                    disabled={isProcessing}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-xs text-muted-foreground">
            Total pages: <span id="total-pages">{totalPages}</span>
          </div>

          <Button
            id="process-btn"
            variant="gradient"
            className="w-full"
            onClick={processWatermark}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                {loadingMessage || 'Processing...'}
              </span>
            ) : (
              'Add Watermark & Download'
            )}
          </Button>

          {success && (
            <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-md">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-sm text-foreground">{success}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}
        </div>
      )}

      {isProcessing && loadingMessage && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-foreground">{loadingMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

