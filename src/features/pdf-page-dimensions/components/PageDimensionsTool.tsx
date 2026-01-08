"use client";

import Link from "next/link";
import { usePageDimensions } from "../hooks/usePageDimensions";
import { PDFUploadSection } from "@/components/common/PDFUploadSection";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { convertPoints } from "@/lib/pdf/page-dimensions-utils";

export const PageDimensionsTool = () => {
  const {
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    pageData,
    selectedUnit,
    loadPDF,
    setSelectedUnit,
    reset,
  } = usePageDimensions();

  const showResults =
    pdfDoc !== null && !isLoadingPDF && !pdfError && pageData.length > 0;

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
        Analyze Page Dimensions
      </h2>
      <p className="mb-6 text-muted-foreground">
        Upload a PDF to see the precise dimensions, standard size, and
        orientation of every page.
      </p>

      <PDFUploadSection
        pdfFile={pdfFile}
        pdfDoc={pdfDoc}
        isLoadingPDF={isLoadingPDF}
        pdfError={pdfError}
        loadPDF={loadPDF}
        reset={reset}
      />

      {showResults && (
        <div id="dimensions-results" className="mt-6">
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-3">
              <Label htmlFor="units-select" className="text-sm font-medium">
                Display Units:
              </Label>
              <Select
                value={selectedUnit}
                onValueChange={(value) =>
                  setSelectedUnit(value as "pt" | "in" | "mm" | "px")
                }
              >
                <SelectTrigger id="units-select" className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt">Points (pt)</SelectItem>
                  <SelectItem value="in">Inches (in)</SelectItem>
                  <SelectItem value="mm">Millimeters (mm)</SelectItem>
                  <SelectItem value="px">Pixels (at 96 DPI)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3">Page #</TableHead>
                  <TableHead className="px-4 py-3">
                    Dimensions (W x H)
                  </TableHead>
                  <TableHead className="px-4 py-3">Standard Size</TableHead>
                  <TableHead className="px-4 py-3">Orientation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageData.map((page) => {
                  const width = convertPoints(page.width, selectedUnit);
                  const height = convertPoints(page.height, selectedUnit);
                  return (
                    <TableRow key={page.pageNum}>
                      <TableCell className="px-4 py-3 font-medium">
                        {page.pageNum}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {width} x {height} {selectedUnit}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {page.standardSize}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {page.orientation}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};
