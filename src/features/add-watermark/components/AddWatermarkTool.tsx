'use client';

import Link from 'next/link';
import { useAddWatermark } from '../hooks/useAddWatermark';
import { PDFUploadSection } from '@/components/common/PDFUploadSection';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessMessages } from '@/components/common/ProcessMessages';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

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

      <PDFUploadSection
        pdfFile={pdfFile}
        pdfDoc={pdfDoc}
        isLoadingPDF={isLoadingPDF}
        pdfError={pdfError}
        loadPDF={loadPDF}
        reset={reset}
        disabled={isProcessing}
      />

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
                       value={[Number.parseFloat(opacityText)]}
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
                    className="bg-background! dark:bg-card! cursor-pointer text-xs"
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
                     value={[Number.parseFloat(opacityImage)]}
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

          <ProcessButton
            onClick={processWatermark}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
          >
            Add Watermark & Download
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

