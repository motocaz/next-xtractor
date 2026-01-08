"use client";

import { useRef } from "react";
import { FileUploader } from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, Braces, CheckCircle2, X } from "lucide-react";
import type { BookmarkNode } from "../types";

interface UploadSectionProps {
  onPDFSelected: (file: File) => void;
  onCSVSelected: (file: File) => void;
  onJSONSelected: (file: File) => void;
  autoExtract: boolean;
  onAutoExtractChange: (value: boolean) => void;
  pendingImport: {
    type: "csv" | "json";
    fileName: string;
    bookmarks: BookmarkNode[];
  } | null;
  onClearPendingImport: () => void;
}

export const UploadSection = ({
  onPDFSelected,
  onCSVSelected,
  onJSONSelected,
  autoExtract,
  onAutoExtractChange,
  pendingImport,
  onClearPendingImport,
}: UploadSectionProps) => {
  const csvInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="bg-card rounded-xl shadow-xl p-8 max-w-md w-full border border-border">
        <p className="text-muted-foreground mb-6">
          Upload a PDF to begin editing bookmarks
        </p>

        <div className="mb-4">
          <FileUploader
            accept="application/pdf"
            multiple={false}
            onFilesSelected={(files) => {
              if (files.length > 0) {
                onPDFSelected(files[0]);
              }
            }}
            disabled={false}
          />
        </div>

        <div className="mb-4">
          <Label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoExtract}
              onChange={(e) => onAutoExtractChange(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Auto-extract existing bookmarks</span>
          </Label>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Or Import Bookmarks
          </h3>

          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                CSV format: title,page,level
              </Label>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => csvInputRef.current?.click()}
              >
                <Sheet className="h-4 w-4 mr-2" />
                Upload CSV
              </Button>
              <Input
                ref={csvInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onCSVSelected(file);
                    e.target.value = "";
                  }
                }}
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                JSON format
              </Label>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => jsonInputRef.current?.click()}
              >
                <Braces className="h-4 w-4 mr-2" />
                Upload JSON
              </Button>
              <Input
                ref={jsonInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onJSONSelected(file);
                    e.target.value = "";
                  }
                }}
              />
            </div>
          </div>

          {pendingImport && (
            <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-md">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {pendingImport.fileName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {pendingImport.type.toUpperCase()} file loaded (
                      {pendingImport.bookmarks.length} bookmark
                      {pendingImport.bookmarks.length === 1 ? "" : "s"})
                      <span className="block mt-1 text-primary">
                        Ready to apply when PDF is uploaded
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClearPendingImport}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                  aria-label="Remove file"
                  title="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
