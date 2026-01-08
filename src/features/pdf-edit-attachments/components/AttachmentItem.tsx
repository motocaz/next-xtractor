"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import type { AttachmentInfo } from "../types";

export interface AttachmentItemProps {
  attachment: AttachmentInfo;
  isSelected: boolean;
  onToggle: () => void;
}

export const AttachmentItem = ({
  attachment,
  isSelected,
  onToggle,
}: AttachmentItemProps) => {
  return (
    <Card
      className={`flex items-center justify-between p-3 border ${
        isSelected ? "opacity-50 line-through" : ""
      }`}
      data-attachment-index={attachment.index}
    >
      <div className="flex-1">
        <span className="text-foreground font-medium block">
          {attachment.name}
        </span>
        <span className="text-muted-foreground text-sm block">
          {attachment.page === 0
            ? "Document-level attachment"
            : `Page ${attachment.page} attachment`}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className={`${
            isSelected
              ? "bg-muted-foreground/60 hover:bg-muted-foreground/70 text-white"
              : "bg-destructive hover:bg-destructive/90 text-white"
          }`}
          onClick={onToggle}
          title="Remove attachment"
          aria-label="Remove attachment"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};
