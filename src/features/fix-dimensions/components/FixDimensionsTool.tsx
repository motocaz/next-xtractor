"use client";

import Link from "next/link";
import { useFixDimensions } from "../hooks/useFixDimensions";
import { PDFUploadSection } from "@/components/common/PDFUploadSection";
import { ProcessButton } from "@/components/common/ProcessButton";
import { ProcessMessages } from "@/components/common/ProcessMessages";
import { ProcessLoadingModal } from "@/components/common/ProcessLoadingModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft } from "lucide-react";

export const FixDimensionsTool = () => {
  const {
    targetSize,
    orientation,
    scalingMode,
    backgroundColor,
    customWidth,
    customHeight,
    customUnits,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    setTargetSize,
    setOrientation,
    setScalingMode,
    setBackgroundColor,
    setCustomWidth,
    setCustomHeight,
    setCustomUnits,
    loadPDF,
    processFixDimensions,
    reset,
  } = useFixDimensions();

  const showOptions = pdfDoc !== null && !isLoadingPDF && !pdfError;
  const showCustomSize = targetSize === "Custom";

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
        Standardize Page Dimensions
      </h2>
      <p className="mb-6 text-muted-foreground">
        Convert all pages in your PDF to a uniform size. Choose a standard
        format or define a custom dimension.
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
        <div id="fix-dimensions-options" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target-size">Target Size</Label>
              <Select
                value={targetSize}
                onValueChange={setTargetSize}
                disabled={isProcessing}
              >
                <SelectTrigger id="target-size" className="w-full">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4</SelectItem>
                  <SelectItem value="Letter">Letter</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                  <SelectItem value="Tabloid">Tabloid</SelectItem>
                  <SelectItem value="A3">A3</SelectItem>
                  <SelectItem value="A5">A5</SelectItem>
                  <SelectItem value="Custom">Custom Size...</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orientation">Orientation</Label>
              <Select
                value={orientation}
                onValueChange={(value) =>
                  setOrientation(value as "portrait" | "landscape")
                }
                disabled={isProcessing}
              >
                <SelectTrigger id="orientation" className="w-full">
                  <SelectValue placeholder="Select orientation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {showCustomSize && (
            <Card>
              <CardContent className="pt-6 pb-6">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="custom-width" className="text-xs">
                      Width
                    </Label>
                    <Input
                      type="number"
                      id="custom-width"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(e.target.value)}
                      className="w-full"
                      disabled={isProcessing}
                      min="0.1"
                      step="0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom-height" className="text-xs">
                      Height
                    </Label>
                    <Input
                      type="number"
                      id="custom-height"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(e.target.value)}
                      className="w-full"
                      disabled={isProcessing}
                      min="0.1"
                      step="0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom-units" className="text-xs">
                      Units
                    </Label>
                    <Select
                      value={customUnits}
                      onValueChange={(value) =>
                        setCustomUnits(value as "in" | "mm")
                      }
                      disabled={isProcessing}
                    >
                      <SelectTrigger id="custom-units" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in">Inches</SelectItem>
                        <SelectItem value="mm">Millimeters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <Label>Content Scaling Method</Label>
            <RadioGroup
              value={scalingMode}
              onValueChange={(value) => setScalingMode(value as "fit" | "fill")}
              disabled={isProcessing}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <label className="flex-1 flex items-start gap-3 p-4 rounded-md border border-input hover:bg-accent cursor-pointer transition-colors">
                <RadioGroupItem value="fit" id="scaling-fit" className="mt-1" />
                <div className="flex-1">
                  <span className="font-semibold text-foreground block mb-1">
                    Fit
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Preserves all content, may add white bars.
                  </p>
                </div>
              </label>
              <label className="flex-1 flex items-start gap-3 p-4 rounded-md border border-input hover:bg-accent cursor-pointer transition-colors">
                <RadioGroupItem
                  value="fill"
                  id="scaling-fill"
                  className="mt-1"
                />
                <div className="flex-1">
                  <span className="font-semibold text-foreground block mb-1">
                    Fill
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Covers the page, may crop content.
                  </p>
                </div>
              </label>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="background-color">
              Background Color (for &apos;Fit&apos; mode)
            </Label>
            <Input
              type="color"
              id="background-color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="h-[42px] p-1 cursor-pointer w-full"
              disabled={isProcessing}
            />
          </div>

          <div className="text-xs text-muted-foreground">
            Total pages: <span id="total-pages">{totalPages}</span>
          </div>

          <ProcessButton
            onClick={processFixDimensions}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
          >
            Standardize Pages
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
