"use client";

import Link from "next/link";
import { useDecryptPDF } from "../hooks/useDecryptPDF";
import { PDFUploadSection } from "@/components/common/PDFUploadSection";
import { ProcessButton } from "@/components/common/ProcessButton";
import { ProcessMessages } from "@/components/common/ProcessMessages";
import { ProcessLoadingModal } from "@/components/common/ProcessLoadingModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export const DecryptPDFTool = () => {
  const {
    password,
    isProcessing,
    loadingMessage,
    error,
    success,
    pdfFile,
    isLoadingPDF,
    pdfError,
    setPassword,
    loadPDF,
    decryptPDF,
    reset,
  } = useDecryptPDF();

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

      <h2 className="text-2xl font-bold text-foreground mb-4">Decrypt PDF</h2>
      <p className="mb-6 text-muted-foreground">
        Upload an encrypted PDF and provide its password to create an unlocked
        version.
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
        <div id="decrypt-options" className="mt-6 space-y-4">
          <div>
            <Label htmlFor="password-input">Enter PDF Password</Label>
            <Input
              type="password"
              id="password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter the current password"
              className="mt-2"
              disabled={isProcessing}
            />
          </div>

          <ProcessButton
            onClick={decryptPDF}
            isProcessing={isProcessing}
            loadingMessage={loadingMessage}
          >
            Decrypt & Download
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
