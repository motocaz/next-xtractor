"use client";

import { Spinner } from "@/components/ui/spinner";

export interface ProcessLoadingModalProps {
  isProcessing: boolean;
  loadingMessage: string | null;
}

export const ProcessLoadingModal = ({
  isProcessing,
  loadingMessage,
}: ProcessLoadingModalProps) => {
  if (!isProcessing || !loadingMessage) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-foreground">{loadingMessage}</p>
      </div>
    </div>
  );
};
