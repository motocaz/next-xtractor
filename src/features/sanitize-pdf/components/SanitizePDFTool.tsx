"use client";

import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useSanitizePDF } from "../hooks/useSanitizePDF";
import { PDFUploadSection } from "@/components/common/PDFUploadSection";
import { ProcessButton } from "@/components/common/ProcessButton";
import { ProcessMessages } from "@/components/common/ProcessMessages";
import { ProcessLoadingModal } from "@/components/common/ProcessLoadingModal";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { SanitizeOptions } from "../types";

const ESSENTIAL_OPTIONS: Array<{
  key: keyof SanitizeOptions;
  label: string;
}> = [
  { key: "flattenForms", label: "Flatten Form Fields" },
  { key: "removeMetadata", label: "Remove All Metadata" },
  { key: "removeAnnotations", label: "Remove Annotations" },
  { key: "removeJavascript", label: "Remove JavaScript" },
  { key: "removeEmbeddedFiles", label: "Remove Embedded Files" },
  { key: "removeLayers", label: "Remove Layers (OCG)" },
  { key: "removeLinks", label: "Remove External Links" },
];

const ADDITIONAL_OPTIONS: Array<{
  key: keyof SanitizeOptions;
  label: string;
}> = [
  { key: "removeStructureTree", label: "Remove Structure Tree" },
  { key: "removeMarkInfo", label: "Remove Tagging Info" },
  { key: "removeFonts", label: "Remove Embedded Fonts" },
];

export const SanitizePDFTool = () => {
  const {
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    options,
    setOption,
    sanitizePDF,
    loadPDF,
    reset,
  } = useSanitizePDF();

  const showOptions = pdfDoc !== null && !isLoadingPDF && !pdfError;
  const hasAnyOption = Object.values(options).some((value) => value === true);
  const canProcess = pdfDoc !== null && hasAnyOption && !isProcessing;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <Link
        href="/#tools-header"
        className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 font-semibold transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Tools</span>
      </Link>

      <h2 className="text-2xl font-bold text-foreground mb-4">Sanitize PDF</h2>
      <p className="mb-6 text-muted-foreground">
        Remove potentially sensitive or unnecessary information from your PDF
        before sharing. Select the items you want to remove.
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
        <div className="mt-6 space-y-6">
          <Card className="bg-input border-border">
            <CardContent className="pt-6 pb-6">
              <div className="mb-4 p-3 rounded-md bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                <div className="text-sm text-foreground">
                  <strong className="font-semibold text-yellow-500">
                    Note:
                  </strong>{" "}
                  Removing{" "}
                  <code className="bg-background px-1 rounded text-foreground text-xs">
                    Embedded Fonts
                  </code>{" "}
                  may break text rendering! Text may not display correctly or at
                  all. Only use if you&apos;re sure the PDF viewer has
                  substitute fonts.
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                  Essential Security
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ESSENTIAL_OPTIONS.map(({ key, label }) => (
                    <Label
                      key={key}
                      htmlFor={`sanitize-${key}`}
                      className="flex items-center gap-2 p-3 rounded-md bg-background hover:bg-input cursor-pointer border border-transparent hover:border-border transition-colors"
                    >
                      <Checkbox
                        id={`sanitize-${key}`}
                        checked={options[key]}
                        onCheckedChange={(checked) =>
                          setOption(key, checked === true)
                        }
                        disabled={isProcessing}
                      />
                      <span className="text-foreground text-sm">{label}</span>
                    </Label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                  Additional Options
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ADDITIONAL_OPTIONS.map(({ key, label }) => (
                    <Label
                      key={key}
                      htmlFor={`sanitize-${key}`}
                      className="flex items-center gap-2 p-3 rounded-md bg-background hover:bg-input cursor-pointer border border-transparent hover:border-border transition-colors"
                    >
                      <Checkbox
                        id={`sanitize-${key}`}
                        checked={options[key]}
                        onCheckedChange={(checked) =>
                          setOption(key, checked === true)
                        }
                        disabled={isProcessing}
                      />
                      <span className="text-foreground text-sm">{label}</span>
                    </Label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <ProcessButton
            onClick={sanitizePDF}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
            disabled={!canProcess}
          >
            Sanitize PDF & Download
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
