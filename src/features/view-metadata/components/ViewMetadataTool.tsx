"use client";

import Link from "next/link";
import { useViewMetadata } from "../hooks/useViewMetadata";
import { PDFUploadSection } from "@/components/common/PDFUploadSection";
import { ProcessMessages } from "@/components/common/ProcessMessages";
import { ProcessLoadingModal } from "@/components/common/ProcessLoadingModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export const ViewMetadataTool = () => {
  const {
    pdfFile,
    isLoading,
    loadingMessage,
    error,
    metadata,
    loadPDF,
    reset,
  } = useViewMetadata();

  const showMetadata = metadata !== null && !isLoading && !error;

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
        View PDF Metadata
      </h2>
      <p className="mb-6 text-muted-foreground">
        Upload a PDF to view its internal properties, such as Title, Author, and
        Creation Date.
      </p>

      <PDFUploadSection
        pdfFile={pdfFile}
        pdfDoc={null}
        isLoadingPDF={isLoading}
        pdfError={error}
        loadPDF={loadPDF}
        reset={reset}
        disabled={isLoading}
      />

      {showMetadata && (
        <div className="mt-6 space-y-4">
          <Card className="mb-4">
            <CardHeader className="pt-6">
              <CardTitle>Info Dictionary</CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              {Object.keys(metadata.info).length > 0 ? (
                <ul className="space-y-3 text-sm">
                  {Object.entries(metadata.info).map(([key, value]) => (
                    <li
                      key={key}
                      className="flex flex-col sm:flex-row gap-2 sm:gap-0"
                    >
                      <strong className="w-40 shrink-0 text-muted-foreground">
                        {key}
                      </strong>
                      <div className="grow text-foreground break-all">
                        {value || "- Not Set -"}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  - No Info Dictionary data found -
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader className="pt-6">
              <CardTitle>Interactive Form Fields</CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              {metadata.formFields.length > 0 ? (
                <ul className="space-y-3 text-sm">
                  {metadata.formFields.map((field, index) => (
                    <li
                      key={index}
                      className="flex flex-col sm:flex-row gap-2 sm:gap-0"
                    >
                      <strong className="w-40 shrink-0 text-muted-foreground">
                        {field.fieldName}
                      </strong>
                      <div className="grow text-foreground break-all">
                        {field.fieldValue || "- Not Set -"}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  - No interactive form fields found -
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader className="pt-6">
              <CardTitle>XMP Metadata</CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              {metadata.xmpNodes.length > 0 &&
              metadata.xmpNodes[0]?.key === "Error" ? (
                <div>
                  <p className="text-sm text-destructive italic mb-2">
                    - Error parsing XMP XML. Displaying raw. -
                  </p>
                  {metadata.rawXmpString && (
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all bg-muted p-3 rounded">
                      {metadata.rawXmpString}
                    </pre>
                  )}
                </div>
              ) : metadata.xmpNodes.length > 0 ? (
                <ul className="space-y-3 text-sm">
                  {metadata.xmpNodes.map((node, index) => (
                    <li
                      key={index}
                      className={`flex ${
                        node.isHeader
                          ? "pt-2 flex-col"
                          : "flex-col sm:flex-row gap-2 sm:gap-0"
                      }`}
                      style={{
                        paddingLeft:
                          node.indent > 0
                            ? `${node.indent * 1.2}rem`
                            : undefined,
                      }}
                    >
                      <strong
                        className={`${
                          node.isHeader
                            ? "w-full shrink-0 text-foreground font-medium"
                            : "w-56 shrink-0 text-muted-foreground"
                        }`}
                      >
                        {node.key}
                      </strong>
                      {!node.isHeader && node.value && (
                        <div className="grow text-foreground break-all">
                          {node.value}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : metadata.rawXmpString ? (
                <div>
                  <p className="text-sm text-destructive italic mb-2">
                    - Error parsing XMP XML. Displaying raw. -
                  </p>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all bg-muted p-3 rounded">
                    {metadata.rawXmpString}
                  </pre>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  - No XMP metadata found -
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <ProcessMessages success={null} error={error} />

      <ProcessLoadingModal
        isProcessing={isLoading}
        loadingMessage={loadingMessage}
      />
    </div>
  );
};
