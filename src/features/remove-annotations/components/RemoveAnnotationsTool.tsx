'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRemoveAnnotations } from '../hooks/useRemoveAnnotations';
import { PDFUploadSection } from '@/components/common/PDFUploadSection';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessMessages } from '@/components/common/ProcessMessages';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import type { AnnotationType } from '../types';

const ANNOTATION_TYPES: Array<{ type: AnnotationType; label: string }> = [
  { type: 'Highlight', label: 'Highlight' },
  { type: 'StrikeOut', label: 'Strikeout' },
  { type: 'Underline', label: 'Underline' },
  { type: 'Ink', label: 'Ink / Draw' },
  { type: 'Polygon', label: 'Polygon' },
  { type: 'Square', label: 'Square' },
  { type: 'Circle', label: 'Circle' },
  { type: 'Line', label: 'Line / Arrow' },
  { type: 'PolyLine', label: 'Polyline' },
  { type: 'Link', label: 'Link' },
  { type: 'Text', label: 'Text (Note)' },
  { type: 'FreeText', label: 'Free Text' },
  { type: 'Popup', label: 'Popup / Comment' },
  { type: 'Squiggly', label: 'Squiggly' },
  { type: 'Stamp', label: 'Stamp' },
  { type: 'Caret', label: 'Caret' },
  { type: 'FileAttachment', label: 'File Attachment' },
];

export const RemoveAnnotationsTool = () => {
  const {
    pageScope,
    pageRange,
    selectedTypes,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    setPageScope,
    setPageRange,
    toggleAnnotationType,
    selectAllTypes,
    deselectAllTypes,
    removeAnnotations,
    loadPDF,
    reset,
  } = useRemoveAnnotations();

  const showOptions = pdfDoc !== null && !isLoadingPDF && !pdfError;
  const allSelected = selectedTypes.size === ANNOTATION_TYPES.length;

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      selectAllTypes();
    } else {
      deselectAllTypes();
    }
  };

  const canProcess = pdfDoc !== null && selectedTypes.size > 0 && !isProcessing;

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
        Remove Annotations
      </h2>
      <p className="mb-6 text-muted-foreground">
        Select the types of annotations to remove from all pages or a specific
        range.
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
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              1. Choose Pages
            </h3>
            <Card>
              <CardContent className="pt-6">
                <RadioGroup
                  value={pageScope}
                  onValueChange={(value) => setPageScope(value as 'all' | 'specific')}
                  className="flex gap-4"
                >
                  <Label
                    htmlFor="page-scope-all"
                    className="flex-1 flex items-center gap-2 p-3 rounded-md hover:bg-input cursor-pointer border border-transparent hover:border-border transition-colors"
                  >
                    <RadioGroupItem value="all" id="page-scope-all" />
                    <span className="font-semibold text-foreground">All Pages</span>
                  </Label>
                  <Label
                    htmlFor="page-scope-specific"
                    className="flex-1 flex items-center gap-2 p-3 rounded-md hover:bg-input cursor-pointer border border-transparent hover:border-border transition-colors"
                  >
                    <RadioGroupItem value="specific" id="page-scope-specific" />
                    <span className="font-semibold text-foreground">
                      Specific Pages
                    </span>
                  </Label>
                </RadioGroup>

                {pageScope === 'specific' && (
                  <div className="mt-4">
                    <Label htmlFor="page-range-input">
                      Enter page range (e.g., 1-3, 5, 8):
                    </Label>
                    <Input
                      type="text"
                      id="page-range-input"
                      value={pageRange}
                      onChange={(e) => setPageRange(e.target.value)}
                      placeholder="e.g., 1-3, 5, 8"
                      className="mt-2"
                      disabled={isProcessing}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Total Pages: {totalPages}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              2. Select Annotation Types to Remove
            </h3>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="border-b border-border pb-2">
                    <Label
                      htmlFor="select-all-annotations"
                      className="flex items-center gap-2 font-semibold text-foreground cursor-pointer"
                    >
                      <Checkbox
                        id="select-all-annotations"
                        checked={allSelected}
                        onCheckedChange={handleSelectAllChange}
                        disabled={isProcessing}
                      />
                      Select / Deselect All
                    </Label>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 pt-2">
                    {ANNOTATION_TYPES.map(({ type, label }) => (
                      <Label
                        key={type}
                        htmlFor={`annot-${type}`}
                        className="flex items-center gap-2 cursor-pointer text-sm"
                      >
                        <Checkbox
                          id={`annot-${type}`}
                          checked={selectedTypes.has(type)}
                          onCheckedChange={() => toggleAnnotationType(type)}
                          disabled={isProcessing}
                        />
                        {label}
                      </Label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <ProcessButton
            onClick={removeAnnotations}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
            disabled={!canProcess}
          >
            Remove Selected Annotations
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

