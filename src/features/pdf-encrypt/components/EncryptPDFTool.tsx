"use client";

import Link from "next/link";
import { useEncryptPDF } from "../hooks/useEncryptPDF";
import { PDFUploadSection } from "@/components/common/PDFUploadSection";
import { ProcessButton } from "@/components/common/ProcessButton";
import { ProcessMessages } from "@/components/common/ProcessMessages";
import { ProcessLoadingModal } from "@/components/common/ProcessLoadingModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, AlertTriangle, CheckCircle2 } from "lucide-react";

export const EncryptPDFTool = () => {
  const {
    userPassword,
    ownerPassword,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    isLoadingPDF,
    pdfError,
    setUserPassword,
    setOwnerPassword,
    loadPDF,
    encryptPDF,
    reset,
  } = useEncryptPDF();

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

      <h2 className="text-2xl font-bold text-foreground mb-4">Encrypt PDF</h2>
      <p className="mb-6 text-muted-foreground">
        Add 256-bit AES password protection to your PDF.
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
        <div id="encrypt-options" className="mt-6 space-y-4">
          <div>
            <Label htmlFor="user-password-input">User Password</Label>
            <Input
              type="password"
              id="user-password-input"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              placeholder="Password to open the PDF"
              className="mt-2"
              disabled={isProcessing}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Required to open and view the PDF
            </p>
          </div>

          <div>
            <Label htmlFor="owner-password-input">
              Owner Password (Optional)
            </Label>
            <Input
              type="password"
              id="owner-password-input"
              value={ownerPassword}
              onChange={(e) => setOwnerPassword(e.target.value)}
              placeholder="Password for full permissions (recommended)"
              className="mt-2"
              disabled={isProcessing}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Allows changing permissions and removing encryption
            </p>
          </div>

          <Card className="border-yellow-500/30 bg-yellow-500/10 dark:bg-yellow-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <h3 className="font-semibold text-base mb-2 text-foreground">
                    Security Recommendation
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    For strong security, set both passwords. Without an owner
                    password, the security restrictions (printing, copying,
                    etc.) can be easily bypassed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/30 bg-green-500/10 dark:bg-green-500/5">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-green-600 dark:text-green-400" />
                <div>
                  <h3 className="font-semibold text-base mb-2 text-foreground">
                    High-Quality Encryption
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    256-bit AES encryption without quality loss. Text remains
                    selectable and searchable.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <ProcessButton
            onClick={encryptPDF}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
          >
            Encrypt & Download
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
