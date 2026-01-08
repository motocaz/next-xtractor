"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";

export interface ProcessMessagesProps {
  success: string | null;
  error: string | null;
}

export const ProcessMessages = ({ success, error }: ProcessMessagesProps) => {
  return (
    <>
      {success && (
        <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-md">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <span className="text-sm text-foreground">{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <span className="text-sm text-destructive">{error}</span>
        </div>
      )}
    </>
  );
};
