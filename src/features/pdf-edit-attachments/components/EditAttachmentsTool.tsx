'use client';

import Link from 'next/link';
import { useEditAttachments } from '../hooks/useEditAttachments';
import { PDFUploadSection } from '@/components/common/PDFUploadSection';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessMessages } from '@/components/common/ProcessMessages';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AttachmentItem } from './AttachmentItem';

export const EditAttachmentsTool = () => {
  const {
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    pdfDoc,
    isLoadingPDF,
    pdfError,
    attachments,
    attachmentsToRemove,
    isLoadingAttachments,
    loadPDF,
    toggleAttachmentRemoval,
    toggleAllAttachments,
    processAndSave,
    reset,
  } = useEditAttachments();

  const showAttachmentsList =
    pdfDoc !== null && !isLoadingPDF && !pdfError && !isLoadingAttachments;

  const allSelected =
    attachments.length > 0 &&
    attachments.every((attachment) => attachmentsToRemove.has(attachment.index));

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
        Edit Attachments
      </h2>
      <p className="mb-6 text-muted-foreground">
        View and remove attachments from your PDF. Select attachments to remove
        them from the document.
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

      {isLoadingAttachments && (
        <div className="mt-6 p-4 bg-input rounded-lg">
          <p className="text-sm text-muted-foreground">
            {loadingMessage || 'Loading attachments...'}
          </p>
        </div>
      )}

      {showAttachmentsList && (
        <div id="edit-attachments-options" className="mt-6">
          {attachments.length === 0 ? (
            <div className="p-4 bg-input rounded-lg">
              <p className="text-muted-foreground text-center">
                No attachments found in this PDF.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex justify-end">
                <Button
                  variant="outline"
                  onClick={toggleAllAttachments}
                  disabled={isProcessing}
                >
                  {allSelected
                    ? 'Deselect All'
                    : 'Remove All Attachments'}
                </Button>
              </div>

              <div className="space-y-3">
                {attachments.map((attachment) => (
                  <AttachmentItem
                    key={attachment.index}
                    attachment={attachment}
                    isSelected={attachmentsToRemove.has(attachment.index)}
                    onToggle={() =>
                      toggleAttachmentRemoval(attachment.index)
                    }
                  />
                ))}
              </div>

              {attachmentsToRemove.size > 0 && (
                <div className="mt-6">
                  <ProcessButton
                    onClick={processAndSave}
                    isProcessing={isProcessing}
                    loadingMessage={loadingMessage}
                  >
                    Process & Download
                  </ProcessButton>

                  <ProcessMessages success={success} error={error} />
                </div>
              )}
            </>
          )}
        </div>
      )}

      <ProcessLoadingModal
        isProcessing={isProcessing}
        loadingMessage={loadingMessage}
      />
    </div>
  );
};

