'use client';

import Link from 'next/link';
import { useFormFiller } from '../hooks/useFormFiller';
import { PDFUploadSection } from '@/components/common/PDFUploadSection';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessMessages } from '@/components/common/ProcessMessages';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';
import { FormFieldRenderer } from './FormFieldRenderer';
import { PDFViewer } from './PDFViewer';
import { ArrowLeft } from 'lucide-react';

export const FormFillerTool = () => {
  const {
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    totalPages,
    formFields,
    fieldValues,
    currentPage,
    zoom,
    isRendering,
    loadPDF,
    updateFieldValue,
    changePage,
    setZoom,
    processAndDownload,
    setCanvasRef,
    reset,
  } = useFormFiller();

  const showOptions = pdfDoc !== null && !isLoadingPDF && !pdfError && formFields.length > 0;
  const showNoFieldsMessage = pdfDoc !== null && !isLoadingPDF && !pdfError && formFields.length === 0;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <Link
        href="/#tools-header"
        className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 font-semibold transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Tools</span>
      </Link>

      <h2 className="text-2xl font-bold text-foreground mb-4">PDF Form Filler</h2>
      <p className="mb-6 text-muted-foreground">
        Upload a PDF to fill in existing form fields. The PDF view on the right will update as you type.
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

      {showNoFieldsMessage && (
        <div className="mt-6 p-4 bg-input rounded-lg border border-accent text-center">
          <p className="text-muted-foreground">This PDF contains no form fields.</p>
        </div>
      )}

      {showOptions && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 min-h-[600px]">
            <div className="w-full lg:w-1/3 bg-input rounded-lg p-4 overflow-y-auto border border-accent shrink-0 max-h-[600px]">
              <h3 className="text-lg font-semibold text-foreground mb-4">Form Fields</h3>
              <div className="space-y-4">
                {formFields.map((field) => (
                  <FormFieldRenderer
                    key={field.name}
                    field={field}
                    value={fieldValues[field.name] ?? field.value}
                    onChange={(value) => updateFieldValue(field.name, value)}
                  />
                ))}
              </div>
            </div>

            <div className="w-full lg:w-2/3 flex flex-col">
              <PDFViewer
                currentPage={currentPage}
                totalPages={totalPages}
                zoom={zoom}
                isRendering={isRendering}
                onPageChange={changePage}
                onZoomChange={setZoom}
                onCanvasRef={setCanvasRef}
              />
            </div>
          </div>

          <ProcessButton
            onClick={processAndDownload}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
          >
            Save & Download
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

