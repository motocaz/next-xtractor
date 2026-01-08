"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useCropPDF } from "../hooks/useCropPDF";
import { FileUploader } from "@/components/FileUploader";
import { ProcessButton } from "@/components/common/ProcessButton";
import { ProcessMessages } from "@/components/common/ProcessMessages";
import { ProcessLoadingModal } from "@/components/common/ProcessLoadingModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { CropData } from "../types";

export const CropPDFTool = () => {
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
    pageCrops,
    cropMode,
    applyToAll,
    currentPageImageUrl,
    loadPDF,
    resetPDF,
    setCropMode,
    setApplyToAll,
    changePage,
    saveCurrentCrop,
    applyCrop,
    setError,
  } = useCropPDF();

  const cropperContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cropperInstanceRef = useRef<any>(null);
  const isCropperReadyRef = useRef<boolean>(false);

  useEffect(() => {
    if (globalThis.window !== undefined) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdn.jsdelivr.net/npm/cropperjs@1.6.2/dist/cropper.min.css";
      document.head.appendChild(link);

      const style = document.createElement("style");
      style.id = "cropper-custom-styles";
      style.textContent = `
        .cropper-container {
          width: 100%;
          height: 100%;
        }
      `;
      document.head.appendChild(style);

      return () => {
        const existingLink = document.querySelector(
          'link[href="https://cdn.jsdelivr.net/npm/cropperjs@1.6.2/dist/cropper.min.css"]',
        );
        if (existingLink) {
          existingLink.remove();
        }
        const existingStyle = document.getElementById("cropper-custom-styles");
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, []);

  useEffect(() => {
    if (!currentPageImageUrl || !cropperContainerRef.current) {
      isCropperReadyRef.current = false;
      return;
    }

    isCropperReadyRef.current = false;

    if (cropperInstanceRef.current) {
      cropperInstanceRef.current.destroy();
      cropperInstanceRef.current = null;
    }

    if (cropperContainerRef.current) {
      cropperContainerRef.current.innerHTML = "";
    }

    const img = document.createElement("img");
    img.src = currentPageImageUrl;
    img.style.display = "block";
    img.style.maxWidth = "none";
    img.style.maxHeight = "none";
    cropperContainerRef.current.appendChild(img);
    imageRef.current = img;

    img.onload = () => {
      if (!img.parentElement) {
        return;
      }

      import("cropperjs")
        .then((CropperModule) => {
          const CropperClass = (CropperModule.default || CropperModule) as
            | (new (img: HTMLImageElement, options?: unknown) => unknown)
            | undefined;

          if (!CropperClass || typeof CropperClass !== "function") {
            console.error(
              "Failed to get Cropper class from module:",
              CropperModule,
            );
            setError(
              "Failed to load cropper library. Please refresh the page.",
            );
            return;
          }

          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cropperInstance: any = new CropperClass(img, {
              viewMode: 1,
              background: false,
              autoCropArea: 0.8,
              responsive: true,
              rotatable: false,
              zoomable: false,
              aspectRatio: Number.NaN,
              ready: () => {
                isCropperReadyRef.current = true;
              },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);

            cropperInstanceRef.current = cropperInstance;
          } catch (error) {
            console.error("Error creating CropperJS instance:", error);
            setError(
              "Failed to initialize cropper. Please try refreshing the page.",
            );
          }

          const savedCrop = pageCrops[currentPageNum];
          if (savedCrop && cropperInstanceRef.current) {
            setTimeout(() => {
              if (
                cropperInstanceRef.current &&
                typeof cropperInstanceRef.current.getImageData === "function" &&
                typeof cropperInstanceRef.current.setData === "function"
              ) {
                try {
                  const imageData = cropperInstanceRef.current.getImageData();
                  const cropData = {
                    x: savedCrop.x * imageData.naturalWidth,
                    y: savedCrop.y * imageData.naturalHeight,
                    width: savedCrop.width * imageData.naturalWidth,
                    height: savedCrop.height * imageData.naturalHeight,
                  };
                  cropperInstanceRef.current.setData(cropData);
                } catch (error) {
                  console.error("Error restoring saved crop data:", error);
                }
              }
            }, 100);
          }
        })
        .catch((error) => {
          console.error("Error importing CropperJS:", error);
          setError(
            "Failed to load cropper library. Please try refreshing the page.",
          );
        });
    };

    img.onerror = (error) => {
      console.error("Image load error:", error);
    };

    return () => {
      isCropperReadyRef.current = false;
      if (cropperInstanceRef.current) {
        cropperInstanceRef.current.destroy();
        cropperInstanceRef.current = null;
      }
    };
  }, [currentPageImageUrl, currentPageNum, pageCrops, setError]);

  const handlePrevPage = async () => {
    if (
      cropperInstanceRef.current &&
      typeof cropperInstanceRef.current.getData === "function" &&
      typeof cropperInstanceRef.current.getImageData === "function"
    ) {
      try {
        const currentCrop = cropperInstanceRef.current.getData(true);
        const imageData = cropperInstanceRef.current.getImageData();
        const cropPercentages: CropData = {
          x: currentCrop.x / imageData.naturalWidth,
          y: currentCrop.y / imageData.naturalHeight,
          width: currentCrop.width / imageData.naturalWidth,
          height: currentCrop.height / imageData.naturalHeight,
        };
        saveCurrentCrop(cropPercentages);
      } catch (error) {
        console.error("Error saving crop data:", error);
      }
    }
    await changePage(-1);
  };

  const handleNextPage = async () => {
    if (
      cropperInstanceRef.current &&
      typeof cropperInstanceRef.current.getData === "function" &&
      typeof cropperInstanceRef.current.getImageData === "function"
    ) {
      try {
        const currentCrop = cropperInstanceRef.current.getData(true);
        const imageData = cropperInstanceRef.current.getImageData();
        const cropPercentages: CropData = {
          x: currentCrop.x / imageData.naturalWidth,
          y: currentCrop.y / imageData.naturalHeight,
          width: currentCrop.width / imageData.naturalWidth,
          height: currentCrop.height / imageData.naturalHeight,
        };
        saveCurrentCrop(cropPercentages);
      } catch (error) {
        console.error("Error saving crop data:", error);
      }
    }
    await changePage(1);
  };

  const handleApplyCrop = async () => {
    if (!cropperInstanceRef.current) {
      setError(
        "Cropper is not initialized. Please wait for the page to finish loading.",
      );
      return;
    }

    if (!isCropperReadyRef.current) {
      setError(
        "Cropper is not ready yet. Please wait for the page to finish loading.",
      );
      return;
    }

    if (
      typeof cropperInstanceRef.current.getData !== "function" ||
      typeof cropperInstanceRef.current.getImageData !== "function"
    ) {
      setError("Cropper is not ready yet. Please wait a moment and try again.");
      return;
    }

    let currentCrop: { x: number; y: number; width: number; height: number };
    let imageData: { naturalWidth: number; naturalHeight: number };

    try {
      currentCrop = cropperInstanceRef.current.getData(true);
      imageData = cropperInstanceRef.current.getImageData();
    } catch (error) {
      console.error("Error accessing cropper methods:", error);
      setError("Failed to get crop data. Please try selecting the area again.");
      return;
    }

    if (
      !imageData?.naturalWidth ||
      !imageData?.naturalHeight ||
      imageData?.naturalWidth === 0 ||
      imageData?.naturalHeight === 0
    ) {
      setError("Unable to get image data. Please try again.");
      return;
    }

    if (
      typeof currentCrop.x !== "number" ||
      typeof currentCrop.y !== "number" ||
      typeof currentCrop.width !== "number" ||
      typeof currentCrop.height !== "number"
    ) {
      setError("Invalid crop data. Please try selecting the area again.");
      return;
    }

    const cropPercentages: CropData = {
      x: currentCrop.x / imageData.naturalWidth,
      y: currentCrop.y / imageData.naturalHeight,
      width: currentCrop.width / imageData.naturalWidth,
      height: currentCrop.height / imageData.naturalHeight,
    };

    saveCurrentCrop(cropPercentages);

    await applyCrop(cropPercentages);
  };

  const canProcess = pdfFile !== null && !isProcessing && !isLoadingPDF;
  const canNavigate = pdfFile !== null && !isProcessing && !isLoadingPDF;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <Link
        href="/#tools-header"
        className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 font-semibold transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Tools</span>
      </Link>

      <h2 className="text-2xl font-bold text-foreground mb-4">Crop PDF</h2>
      <p className="mb-6 text-muted-foreground">
        Trim the margins of every page in your PDF. Select an area to crop on
        each page, or apply the same crop to all pages.
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
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  How it works:
                </h3>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                  <li>
                    <strong className="text-foreground">Live Preview:</strong>{" "}
                    See your crop selection in real-time before you apply it.
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Non-Destructive Mode:
                    </strong>{" "}
                    This is the default mode. It simply &quot;hides&quot; the
                    cropped content by adjusting the page&apos;s boundaries. The
                    original text and data are preserved in the file.
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Destructive Mode:
                    </strong>{" "}
                    This option permanently removes the cropped content by
                    flattening the PDF. Use this for maximum security and
                    smaller file size, but note that it will remove selectable
                    text.
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

            <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                <Checkbox
                  id="destructive-crop-toggle"
                  checked={cropMode === "flattening"}
                  onCheckedChange={(checked) =>
                    setCropMode(checked ? "flattening" : "metadata")
                  }
                  disabled={isProcessing}
                />
                Enable Destructive Crop
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                <Checkbox
                  id="apply-to-all-toggle"
                  checked={applyToAll}
                  onCheckedChange={(checked) => setApplyToAll(checked === true)}
                  disabled={isProcessing}
                />
                Apply to all pages
              </label>
            </div>
          </div>

          <div
            ref={cropperContainerRef}
            className="w-full relative overflow-hidden bg-background rounded-lg border border-border h-[60vh] min-h-[500px] flex items-center justify-center"
          />

          <ProcessButton
            onClick={handleApplyCrop}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
            disabled={!canProcess}
          >
            Crop & Download
          </ProcessButton>

          <ProcessMessages success={success} error={error} />

          {pdfFile && (
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  resetPDF();
                  if (cropperInstanceRef.current) {
                    cropperInstanceRef.current.destroy();
                    cropperInstanceRef.current = null;
                  }
                }}
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
