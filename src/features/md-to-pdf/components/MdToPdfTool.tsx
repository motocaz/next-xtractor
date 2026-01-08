"use client";

import Link from "next/link";
import { useMdToPdf } from "../hooks/useMdToPdf";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProcessButton } from "@/components/common/ProcessButton";
import { ProcessMessages } from "@/components/common/ProcessMessages";
import { ProcessLoadingModal } from "@/components/common/ProcessLoadingModal";
import { ArrowLeft } from "lucide-react";

export const MdToPdfTool = () => {
  const {
    markdownContent,
    pageFormat,
    orientation,
    marginSize,
    isProcessing,
    loadingMessage,
    error,
    success,
    setMarkdownContent,
    setPageFormat,
    setOrientation,
    setMarginSize,
    processMdToPdf,
  } = useMdToPdf();

  const canProcess = markdownContent.trim().length > 0 && !isProcessing;

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
        Markdown to PDF
      </h2>
      <p className="mb-6 text-muted-foreground">
        Write in Markdown, select your formatting options, and get a
        high-quality, multi-page PDF.{" "}
        <strong className="text-foreground">
          Note: Images linked from the web (e.g., https://...) require an
          internet connection to be rendered.
        </strong>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="space-y-2">
          <Label htmlFor="page-format">Page Format</Label>
          <Select
            value={pageFormat}
            onValueChange={(value) => setPageFormat(value as "a4" | "letter")}
            disabled={isProcessing}
          >
            <SelectTrigger id="page-format" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a4">A4</SelectItem>
              <SelectItem value="letter">Letter</SelectItem>
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
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="portrait">Portrait</SelectItem>
              <SelectItem value="landscape">Landscape</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="margin-size">Margin Size</Label>
          <Select
            value={marginSize}
            onValueChange={(value) =>
              setMarginSize(value as "normal" | "narrow" | "wide")
            }
            disabled={isProcessing}
          >
            <SelectTrigger id="margin-size" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="narrow">Narrow</SelectItem>
              <SelectItem value="wide">Wide</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-6" style={{ height: "50vh" }}>
        <Label htmlFor="md-input">Markdown Editor</Label>
        <Textarea
          id="md-input"
          value={markdownContent}
          onChange={(e) => setMarkdownContent(e.target.value)}
          placeholder="# Welcome to Markdown..."
          className="mt-2 h-full font-mono"
          disabled={isProcessing}
        />
      </div>

      <div className="mb-4 mt-8">
        <ProcessMessages success={success} error={error} />
      </div>

      <div className="mt-8">
        <ProcessButton
          onClick={processMdToPdf}
          disabled={!canProcess}
          isProcessing={isProcessing}
          loadingMessage={loadingMessage}
        >
          Create PDF from Markdown
        </ProcessButton>
      </div>

      <ProcessLoadingModal
        isProcessing={isProcessing}
        loadingMessage={loadingMessage}
      />
    </div>
  );
};
