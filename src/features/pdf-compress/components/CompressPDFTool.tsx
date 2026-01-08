"use client";

import Link from "next/link";
import { useCompressPDF } from "../hooks/useCompressPDF";
import { FileUploader } from "@/components/FileUploader";
import { ProcessButton } from "@/components/common/ProcessButton";
import { ProcessMessages } from "@/components/common/ProcessMessages";
import { ProcessLoadingModal } from "@/components/common/ProcessLoadingModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { formatBytes } from "@/lib/pdf/file-utils";
import type { CompressionLevel, CompressionAlgorithm } from "../types";
import { FileListSection } from "@/components/common/FileListSection";

export const CompressPDFTool = () => {
  const {
    pdfFiles,
    compressionLevel,
    compressionAlgorithm,
    isProcessing,
    loadingMessage,
    error,
    success,
    compressionStats,
    loadPDFFiles,
    removePDFFile,
    setCompressionLevel,
    setCompressionAlgorithm,
    processCompression,
  } = useCompressPDF();

  const canProcess = pdfFiles.length > 0 && !isProcessing;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <Link
        href="/#tools-header"
        className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 font-semibold transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Tools</span>
      </Link>

      <h2 className="text-2xl font-bold text-foreground mb-4">Compress PDF</h2>
      <p className="mb-6 text-muted-foreground">
        Reduce file size by choosing the compression method that best suits your
        document. Supports multiple PDFs.
      </p>

      <div className="mb-4">
        <FileUploader
          accept="application/pdf"
          multiple={true}
          onFilesSelected={async (files) => {
            if (files.length > 0) {
              await loadPDFFiles(files);
            }
          }}
          disabled={isProcessing}
        />
      </div>

      {pdfFiles.length > 0 && (
        <FileListSection
          title="PDF Files"
          files={pdfFiles}
          onRemove={removePDFFile}
          disabled={isProcessing}
          showIcon={false}
          className="mb-6"
        />
      )}

      {pdfFiles.length > 0 && (
        <div id="compress-options" className="mb-6 space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="compression-level">Compression Level</Label>
                <Select
                  value={compressionLevel}
                  onValueChange={(value) =>
                    setCompressionLevel(value as CompressionLevel)
                  }
                  disabled={isProcessing}
                >
                  <SelectTrigger id="compression-level" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">
                      Balanced (Recommended)
                    </SelectItem>
                    <SelectItem value="high-quality">
                      High Quality (Larger file)
                    </SelectItem>
                    <SelectItem value="small-size">
                      Smallest Size (Lower quality)
                    </SelectItem>
                    <SelectItem value="extreme">
                      Extreme (Very low quality)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="compression-algorithm">
                  Compression Algorithm
                </Label>
                <Select
                  value={compressionAlgorithm}
                  onValueChange={(value) =>
                    setCompressionAlgorithm(value as CompressionAlgorithm)
                  }
                  disabled={isProcessing}
                >
                  <SelectTrigger id="compression-algorithm" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vector">
                      Vector (For Text Heavy PDF)
                    </SelectItem>
                    <SelectItem value="photon">
                      Photon (For Complex Images & Drawings)
                    </SelectItem>
                    <SelectItem value="automatic">
                      Automatic (Vector first, Photon fallback)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground pt-2 pb-4">
                  Choose &apos;Vector&apos; for text based PDFs, or
                  &apos;Photon&apos; for scanned documents and complex images.
                </p>
              </div>
            </CardContent>
          </Card>

          {compressionStats && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6 pb-6">
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  Compression Statistics
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method:</span>
                    <span className="text-foreground font-medium">
                      {compressionStats.method}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Original Size:
                    </span>
                    <span className="text-foreground">
                      {formatBytes(compressionStats.originalSize)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Compressed Size:
                    </span>
                    <span className="text-foreground">
                      {formatBytes(compressionStats.compressedSize)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Savings:</span>
                    <span className="text-foreground font-semibold">
                      {formatBytes(compressionStats.savings)} (
                      {compressionStats.savingsPercent}%)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <ProcessButton
            onClick={processCompression}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
            disabled={!canProcess}
          >
            Compress PDF{pdfFiles.length > 1 ? "s" : ""}
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
