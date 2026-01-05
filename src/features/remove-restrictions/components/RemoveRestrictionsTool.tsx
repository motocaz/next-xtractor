'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRemoveRestrictions } from '../hooks/useRemoveRestrictions';
import { PDFUploadSection } from '@/components/common/PDFUploadSection';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessMessages } from '@/components/common/ProcessMessages';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export const RemoveRestrictionsTool = () => {
  const {
    ownerPassword,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    isLoadingPDF,
    pdfError,
    setOwnerPassword,
    loadPDF,
    removeRestrictions,
    reset,
  } = useRemoveRestrictions();

  const showOptions = pdfFile !== null && !isLoadingPDF && !pdfError;

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
        Remove PDF Restrictions
      </h2>
      <p className="mb-6 text-muted-foreground">
        Remove security restrictions and unlock PDF permissions for editing and
        printing.
      </p>

      <PDFUploadSection
        pdfFile={pdfFile}
        isLoadingPDF={isLoadingPDF}
        pdfError={pdfError}
        loadPDF={loadPDF}
        reset={reset}
        disabled={isProcessing}
      />

      {showOptions && (
        <div className="mt-6 space-y-4">
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6 pb-6">
              <h3 className="font-semibold text-base mb-2 text-primary">
                How it Works
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                This operation will:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-2">
                <li>Remove all permission restrictions (printing, copying, editing)</li>
                <li>Remove encryption even if the file is encrypted</li>
                <li>
                  Remove security restrictions associated with digitally signed PDF
                  files (will make signature invalid)
                </li>
                <li>Create a fully editable, unrestricted PDF</li>
              </ul>
            </CardContent>
          </Card>

          <div>
            <Label htmlFor="owner-password-remove">
              Owner Password (if required)
            </Label>
            <Input
              type="password"
              id="owner-password-remove"
              value={ownerPassword}
              onChange={(e) => setOwnerPassword(e.target.value)}
              placeholder="Leave empty if PDF has no password"
              className="mt-2"
              disabled={isProcessing}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter the owner password if the PDF is password-protected
            </p>
          </div>

          <Card className="border-red-500/30 bg-red-900/20">
            <CardContent className="pt-6 pb-6">
              <h3 className="font-semibold text-base mb-2 text-red-200">
                Notice
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                This tool is intended for legitimate purposes only, such as:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-2">
                <li>
                  Removing restrictions from PDFs you own or have permission to modify
                </li>
                <li>
                  Recovering access to a PDF when you legitimately forgot the password
                </li>
                <li>Accessing content you legally purchased or created</li>
                <li>Editing documents for authorized business purposes</li>
                <li>
                  Opening documents for legitimate archival, compliance, or recovery
                  workflows
                </li>
                <li className="font-semibold">
                  Limitations: this tool can only remove restrictions from weakly
                  protected PDFs or PDFs that do not have an owner password set. It
                  cannot remove or bypass properly applied AES‑256 (256‑bit)
                  encryption.
                </li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3 font-semibold">
                Using this tool to bypass copyright protections, violate intellectual
                property rights, or access documents without authorization may be
                illegal in your jurisdiction. We are not liable for any misuse of this
                tool — if you&apos;re unsure, consult legal counsel or the document
                owner before proceeding.
              </p>
            </CardContent>
          </Card>

          <ProcessButton
            onClick={removeRestrictions}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
          >
            Remove Restrictions & Download
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

