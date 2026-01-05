'use client';

import Link from 'next/link';
import { useSignPdf } from '../hooks/useSignPdf';
import { PDFUploadSection } from '@/components/common/PDFUploadSection';
import { ProcessButton } from '@/components/common/ProcessButton';
import { ProcessMessages } from '@/components/common/ProcessMessages';
import { ProcessLoadingModal } from '@/components/common/ProcessLoadingModal';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { SignatureDrawTab } from './SignatureDrawTab';
import { SignatureTypeTab } from './SignatureTypeTab';
import { SignatureUploadTab } from './SignatureUploadTab';
import { SignaturePDFViewer } from './SignaturePDFViewer';
import { useRef } from 'react';

export const SignPdfTool = () => {
  const hook = useSignPdf();
  const containerRef = useRef<HTMLDivElement>(null);

  const showSignatureEditor = hook.pdfDoc !== null && !hook.isLoadingPDF && !hook.pdfError;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <Link
        href="/#tools-header"
        className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 font-semibold transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Tools</span>
      </Link>

      <h2 className="text-2xl font-bold text-foreground mb-4">Sign PDF</h2>
      <p className="mb-6 text-muted-foreground">
        Create your signature, select it, then click on the document to place. You can drag to move placed signatures.
      </p>

      <PDFUploadSection
        pdfFile={hook.pdfFile}
        pdfDoc={hook.pdfDoc}
        isLoadingPDF={hook.isLoadingPDF}
        pdfError={hook.pdfError}
        loadPDF={hook.loadPDF}
        reset={hook.reset}
        disabled={hook.isProcessing}
      />

      {showSignatureEditor && (
        <>
          <Card className="mt-6">
            <CardContent className="p-4">
              <Tabs defaultValue="draw" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="draw">Draw</TabsTrigger>
                  <TabsTrigger value="type">Type</TabsTrigger>
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                </TabsList>
                <TabsContent value="draw" className="mt-4">
                  <SignatureDrawTab
                    onSave={hook.addSignature}
                    disabled={hook.isProcessing}
                  />
                </TabsContent>
                <TabsContent value="type" className="mt-4">
                  <SignatureTypeTab
                    onSave={hook.addSignature}
                    onError={hook.setError}
                    disabled={hook.isProcessing}
                  />
                </TabsContent>
                <TabsContent value="upload" className="mt-4">
                  <SignatureUploadTab
                    onSave={hook.addSignature}
                    disabled={hook.isProcessing}
                  />
                </TabsContent>
              </Tabs>

              <hr className="border-border my-4" />

              <div>
                <h4 className="text-md font-semibold text-foreground mb-2">
                  Your Saved Signatures
                </h4>
                <div className="flex flex-wrap gap-2 bg-input p-2 rounded-md min-h-[50px]">
                  {hook.savedSignatures.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center w-full">
                      Your saved signatures will appear here. Click one to select it.
                    </p>
                  ) : (
                    hook.savedSignatures.map((img, index) => (
                      <div
                        key={index}
                        role="button"
                        tabIndex={0}
                        className={`p-1 bg-background rounded-md cursor-pointer border-2 h-16 flex items-center justify-center transition-colors relative min-w-[80px] ${
                          hook.activeSignature?.index === index
                            ? 'border-primary'
                            : 'border-transparent hover:border-primary/50'
                        }`}
                        onClick={() => hook.selectSignature(index)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            hook.selectSignature(index);
                          }
                        }}
                        aria-label={`Select signature ${index + 1}`}
                      >
                        <img
                          src={img.src}
                          alt={`Signature ${index + 1}`}
                          className="h-full w-auto max-w-full object-contain"
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <SignaturePDFViewer hook={hook} containerRef={containerRef} />
          </div>

          <div className="mt-6">
            <ProcessButton
              onClick={hook.applySignatures}
              disabled={hook.placedSignatures.length === 0}
              isProcessing={hook.isProcessing}
              loadingMessage={hook.loadingMessage}
            >
              Apply Signatures & Download PDF
            </ProcessButton>
          </div>
        </>
      )}

      <ProcessMessages error={hook.error} success={hook.success} />
      <ProcessLoadingModal
        isProcessing={hook.isProcessing}
        loadingMessage={hook.loadingMessage}
      />
    </div>
  );
};

