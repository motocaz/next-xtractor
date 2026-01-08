"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download, ChevronDown, FileText, Braces } from "lucide-react";

interface ImportExportButtonsProps {
  onImportCSV: (file: File) => Promise<void>;
  onImportJSON: (file: File) => Promise<void>;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onError: (error: Error) => void;
}

export const ImportExportButtons = ({
  onImportCSV,
  onImportJSON,
  onExportCSV,
  onExportJSON,
  onError,
}: ImportExportButtonsProps) => {
  const [importDropdownOpen, setImportDropdownOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  const handleImportCSV = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await onImportCSV(file);
        } catch (err) {
          onError(err instanceof Error ? err : new Error("Unknown error"));
        }
      }
    };
    input.click();
    setImportDropdownOpen(false);
  };

  const handleImportJSON = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await onImportJSON(file);
        } catch (err) {
          onError(err instanceof Error ? err : new Error("Unknown error"));
        }
      }
    };
    input.click();
    setImportDropdownOpen(false);
  };

  const handleExportCSV = () => {
    try {
      onExportCSV();
      setExportDropdownOpen(false);
    } catch (err) {
      onError(err instanceof Error ? err : new Error("Unknown error"));
      setExportDropdownOpen(false);
    }
  };

  const handleExportJSON = () => {
    try {
      onExportJSON();
      setExportDropdownOpen(false);
    } catch (err) {
      onError(err instanceof Error ? err : new Error("Unknown error"));
      setExportDropdownOpen(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      <div className="relative">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setImportDropdownOpen(!importDropdownOpen);
            setExportDropdownOpen(false);
          }}
        >
          <Upload className="h-4 w-4 mr-1" />
          Import
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
        {importDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-full bg-card border border-border rounded-lg shadow-lg z-10">
            <Button
              variant="ghost"
              className="w-full justify-start rounded-t-lg"
              onClick={handleImportCSV}
            >
              <FileText className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start rounded-b-lg"
              onClick={handleImportJSON}
            >
              <Braces className="h-4 w-4 mr-2" />
              Import JSON
            </Button>
          </div>
        )}
      </div>

      <div className="relative">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setExportDropdownOpen(!exportDropdownOpen);
            setImportDropdownOpen(false);
          }}
        >
          <Download className="h-4 w-4 mr-1" />
          Export
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
        {exportDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-full bg-card border border-border rounded-lg shadow-lg z-10">
            <Button
              variant="ghost"
              className="w-full justify-start rounded-t-lg"
              onClick={handleExportCSV}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start rounded-b-lg"
              onClick={handleExportJSON}
            >
              <Braces className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
