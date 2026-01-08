"use client";

import Link from "next/link";
import { useEditMetadata } from "../hooks/useEditMetadata";
import { PDFUploadSection } from "@/components/common/PDFUploadSection";
import { ProcessButton } from "@/components/common/ProcessButton";
import { ProcessMessages } from "@/components/common/ProcessMessages";
import { ProcessLoadingModal } from "@/components/common/ProcessLoadingModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Trash2, Info } from "lucide-react";

export const EditMetadataTool = () => {
  const {
    metadata,
    customFields,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    updateMetadataField,
    addCustomField,
    removeCustomField,
    updateCustomField,
    loadPDF,
    processMetadata,
    reset,
  } = useEditMetadata();

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

      <h2 className="text-2xl font-bold text-foreground mb-4">
        Edit PDF Metadata
      </h2>
      <p className="mb-6 text-muted-foreground">
        Modify the core metadata fields of your PDF. Leave a field blank to
        clear it.
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
        <div id="metadata-form" className="mt-6 space-y-4">
          <Card className="border-yellow-500/30 bg-yellow-500/10 dark:bg-yellow-500/5">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 shrink-0 mt-0.5 text-yellow-600 dark:text-yellow-400" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed">
                  <strong className="font-semibold block mb-1.5">
                    Important Note:
                  </strong>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    This tool uses the{" "}
                    <code className="bg-yellow-500/20 dark:bg-yellow-500/30 px-1.5 py-0.5 rounded text-yellow-900 dark:text-yellow-100 font-mono text-xs">
                      pdf-lib
                    </code>{" "}
                    library, which may update the{" "}
                    <strong className="font-semibold">Producer</strong>,{" "}
                    <strong className="font-semibold">CreationDate</strong>, and{" "}
                    <strong className="font-semibold">ModDate</strong> fields
                    due to its default behavior on upload. To accurately view a
                    file&apos;s final metadata after editing, or just normal
                    viewing, please use our{" "}
                    <strong className="font-semibold">View Metadata</strong>{" "}
                    tool.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="meta-title">Title</Label>
              <Input
                type="text"
                id="meta-title"
                value={metadata.title}
                onChange={(e) => updateMetadataField("title", e.target.value)}
                className="mt-2"
                disabled={isProcessing}
              />
            </div>
            <div>
              <Label htmlFor="meta-author">Author</Label>
              <Input
                type="text"
                id="meta-author"
                value={metadata.author}
                onChange={(e) => updateMetadataField("author", e.target.value)}
                className="mt-2"
                disabled={isProcessing}
              />
            </div>
            <div>
              <Label htmlFor="meta-subject">Subject</Label>
              <Input
                type="text"
                id="meta-subject"
                value={metadata.subject}
                onChange={(e) => updateMetadataField("subject", e.target.value)}
                className="mt-2"
                disabled={isProcessing}
              />
            </div>
            <div>
              <Label htmlFor="meta-keywords">Keywords (comma-separated)</Label>
              <Input
                type="text"
                id="meta-keywords"
                value={metadata.keywords}
                onChange={(e) =>
                  updateMetadataField("keywords", e.target.value)
                }
                placeholder="keyword1, keyword2, keyword3"
                className="mt-2"
                disabled={isProcessing}
              />
            </div>
            <div>
              <Label htmlFor="meta-creator">Creator Tool</Label>
              <Input
                type="text"
                id="meta-creator"
                value={metadata.creator}
                onChange={(e) => updateMetadataField("creator", e.target.value)}
                className="mt-2"
                disabled={isProcessing}
              />
            </div>
            <div>
              <Label htmlFor="meta-producer">Producer Tool</Label>
              <Input
                type="text"
                id="meta-producer"
                value={metadata.producer}
                onChange={(e) =>
                  updateMetadataField("producer", e.target.value)
                }
                className="mt-2"
                disabled={isProcessing}
              />
            </div>
            <div>
              <Label htmlFor="meta-creation-date">Creation Date</Label>
              <Input
                type="datetime-local"
                id="meta-creation-date"
                value={metadata.creationDate}
                onChange={(e) =>
                  updateMetadataField("creationDate", e.target.value)
                }
                className="mt-2"
                disabled={isProcessing}
              />
            </div>
            <div>
              <Label htmlFor="meta-mod-date">Modification Date</Label>
              <Input
                type="datetime-local"
                id="meta-mod-date"
                value={metadata.modificationDate}
                onChange={(e) =>
                  updateMetadataField("modificationDate", e.target.value)
                }
                className="mt-2"
                disabled={isProcessing}
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Custom Fields
              </h3>
              <p className="text-sm text-muted-foreground -mt-1">
                Note: Custom fields are not supported by all PDF readers.
              </p>
            </div>

            {customFields.length > 0 && (
              <div className="space-y-3">
                {customFields.map((field, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 custom-field-wrapper"
                  >
                    <Input
                      type="text"
                      placeholder="Key (e.g., Department)"
                      value={field.key}
                      onChange={(e) =>
                        updateCustomField(index, e.target.value, field.value)
                      }
                      className="w-1/3"
                      disabled={isProcessing}
                    />
                    <Input
                      type="text"
                      placeholder="Value (e.g., Marketing)"
                      value={field.value}
                      onChange={(e) =>
                        updateCustomField(index, field.key, e.target.value)
                      }
                      className="grow"
                      disabled={isProcessing}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCustomField(index)}
                      disabled={isProcessing}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={addCustomField}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Custom Field
            </Button>
          </div>

          <ProcessButton
            onClick={processMetadata}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
          >
            Update Metadata & Download
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
