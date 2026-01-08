"use client";

import Link from "next/link";
import { useMergePDF } from "../hooks/useMergePDF";
import { FileUploader } from "@/components/FileUploader";
import { ProcessButton } from "@/components/common/ProcessButton";
import { ProcessMessages } from "@/components/common/ProcessMessages";
import { ProcessLoadingModal } from "@/components/common/ProcessLoadingModal";
import { FileModePanel } from "./FileModePanel";
import { PageModePanel } from "./PageModePanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft } from "lucide-react";

export const MergePDFTool = () => {
  const {
    pdfFiles,
    activeMode,
    pageThumbnails,
    thumbnailImages,
    isLoading,
    isRenderingThumbnails,
    isProcessing,
    loadingMessage,
    error,
    success,
    pageRanges,
    loadPDFs,
    removePDF,
    reorderFiles,
    setActiveMode,
    setPageRange,
    reorderPages,
    processMerge,
    reset,
  } = useMergePDF();

  const canProcess =
    pdfFiles.length > 0 &&
    !isProcessing &&
    !isLoading &&
    !isRenderingThumbnails;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <Link
        href="/#tools-header"
        className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 font-semibold transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Tools</span>
      </Link>

      <h2 className="text-2xl font-bold text-foreground mb-4">Merge PDF</h2>
      <p className="mb-6 text-muted-foreground">
        Combine multiple PDFs into one file. Choose between file mode (merge
        entire PDFs or specific page ranges) or page mode (drag and drop
        individual pages).
      </p>

      <div className="mb-4">
        <FileUploader
          accept="application/pdf"
          multiple={true}
          onFilesSelected={async (files) => {
            if (files.length > 0) {
              await loadPDFs(files);
            }
          }}
          disabled={isLoading || isProcessing || isRenderingThumbnails}
        />
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 p-3 bg-input rounded-md mb-4">
          <Spinner size="sm" />
          <span className="text-sm text-muted-foreground">
            {loadingMessage || "Loading PDFs..."}
          </span>
        </div>
      )}

      <ProcessMessages success={success} error={error} />

      {pdfFiles.length > 0 && (
        <div className="mt-6">
          <Tabs
            value={activeMode}
            onValueChange={(value) => setActiveMode(value as "file" | "page")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file">File Mode</TabsTrigger>
              <TabsTrigger value="page">Page Mode</TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="mt-4">
              <FileModePanel
                pdfFiles={pdfFiles}
                pageRanges={pageRanges}
                onRemove={removePDF}
                onReorder={reorderFiles}
                onPageRangeChange={setPageRange}
              />
            </TabsContent>

            <TabsContent value="page" className="mt-4">
              <PageModePanel
                pageThumbnails={pageThumbnails}
                thumbnailImages={thumbnailImages}
                isRendering={isRenderingThumbnails}
                onReorder={reorderPages}
              />
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex items-center gap-4">
            <ProcessButton
              onClick={processMerge}
              disabled={!canProcess}
              isProcessing={isProcessing}
              loadingMessage={loadingMessage}
            >
              Merge & Download
            </ProcessButton>
            <button
              onClick={reset}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              disabled={isProcessing || isLoading || isRenderingThumbnails}
            >
              Reset
            </button>
          </div>
        </div>
      )}

      <ProcessLoadingModal
        isProcessing={isProcessing || isRenderingThumbnails}
        loadingMessage={loadingMessage}
      />
    </div>
  );
};
