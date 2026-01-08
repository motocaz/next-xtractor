"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export interface ProcessButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isProcessing: boolean;
  loadingMessage: string | null;
  children: React.ReactNode;
}

export const ProcessButton = ({
  onClick,
  disabled = false,
  isProcessing,
  loadingMessage,
  children,
}: ProcessButtonProps) => {
  return (
    <Button
      id="process-btn"
      variant="gradient"
      className="w-full"
      onClick={onClick}
      disabled={isProcessing || disabled}
    >
      {isProcessing ? (
        <span className="flex items-center gap-2">
          <Spinner size="sm" />
          {loadingMessage || "Processing..."}
        </span>
      ) : (
        children
      )}
    </Button>
  );
};
