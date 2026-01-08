"use client";

import Link from "next/link";
import { useTxtToPdf } from "../hooks/useTxtToPdf";
import { FileUploader } from "@/components/FileUploader";
import { ArrowLeft } from "lucide-react";
import { FileUploadStatusMessages } from "@/components/common/FileUploadStatusMessages";
import { ProcessButton } from "@/components/common/ProcessButton";
import { ProcessLoadingModal } from "@/components/common/ProcessLoadingModal";
import { ProcessMessages } from "@/components/common/ProcessMessages";
import { FileListSection } from "@/components/common/FileListSection";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const TxtToPdfTool = () => {
  const {
    txtFiles,
    isLoading,
    fileLoadingMessage,
    fileError,
    fileSuccess,
    loadTxtFiles,
    removeTxtFile,
    textInput,
    setTextInput,
    fontFamily,
    fontSize,
    pageSize,
    textColor,
    setFontFamily,
    setFontSize,
    setPageSize,
    setTextColor,
    isProcessing,
    loadingMessage,
    error,
    success,
    processTxtToPdf,
  } = useTxtToPdf();

  const canProcess =
    (txtFiles.length > 0 || textInput.trim().length > 0) &&
    !isProcessing &&
    !isLoading;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <Link
        href="/#tools-header"
        className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 font-semibold transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Tools</span>
      </Link>

      <h2 className="text-2xl font-bold text-foreground mb-4">Text to PDF</h2>
      <p className="mb-6 text-muted-foreground">
        Upload one or more text files, or type/paste text below to convert to
        PDF with custom formatting.
      </p>

      <div className="mb-6">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
            <TabsTrigger value="text">Type Text</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <FileUploader
              accept="text/plain,.txt"
              multiple={true}
              onFilesSelected={async (files) => {
                if (files.length > 0) {
                  await loadTxtFiles(files);
                }
              }}
              disabled={isLoading || isProcessing}
            />

            <FileUploadStatusMessages
              isLoading={isLoading}
              loadingMessage={fileLoadingMessage}
              defaultLoadingText="Loading text files..."
              error={fileError}
              success={fileSuccess}
            />

            {txtFiles.length > 0 && (
              <FileListSection
                title="Text Files"
                files={txtFiles}
                onRemove={removeTxtFile}
                disabled={isProcessing}
                showIcon={true}
              />
            )}
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-input">Text Input</Label>
              <Textarea
                id="text-input"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Start typing here..."
                rows={12}
                className="font-sans"
                disabled={isProcessing}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Formatting Options
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="font-family">Font Family</Label>
            <Select
              value={fontFamily}
              onValueChange={(value) =>
                setFontFamily(value as typeof fontFamily)
              }
              disabled={isProcessing}
            >
              <SelectTrigger id="font-family" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Helvetica">Helvetica</SelectItem>
                <SelectItem value="TimesRoman">Times New Roman</SelectItem>
                <SelectItem value="Courier">Courier</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="font-size">Font Size</Label>
            <Input
              id="font-size"
              type="number"
              value={fontSize}
              onChange={(e) => {
                const value = Number.parseInt(e.target.value, 10);
                if (!Number.isNaN(value) && value > 0) {
                  setFontSize(value);
                }
              }}
              min={1}
              className="w-full"
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="page-size">Page Size</Label>
            <Select
              value={pageSize}
              onValueChange={(value) => setPageSize(value as typeof pageSize)}
              disabled={isProcessing}
            >
              <SelectTrigger id="page-size" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4</SelectItem>
                <SelectItem value="Letter">Letter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="text-color">Text Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="text-color"
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="h-9 w-full cursor-pointer"
                disabled={isProcessing}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <ProcessMessages success={success} error={error} />
      </div>

      {canProcess && (
        <ProcessButton
          onClick={processTxtToPdf}
          disabled={!canProcess}
          isProcessing={isProcessing}
          loadingMessage={loadingMessage}
        >
          Create PDF
        </ProcessButton>
      )}

      <ProcessLoadingModal
        isProcessing={isProcessing}
        loadingMessage={loadingMessage}
      />
    </div>
  );
};
