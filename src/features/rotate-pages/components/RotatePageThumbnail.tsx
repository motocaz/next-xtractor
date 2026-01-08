"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

interface RotatePageThumbnailProps {
  pageNum: number;
  thumbnailUrl: string;
  rotation: number;
  onRotate: () => void;
  disabled?: boolean;
}

export const RotatePageThumbnail = ({
  pageNum,
  thumbnailUrl,
  rotation,
  onRotate,
  disabled = false,
}: RotatePageThumbnailProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-full h-36 bg-background rounded-lg flex items-center justify-center overflow-hidden border-2 border-border hover:border-primary transition-colors">
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: "transform 0.2s ease",
          }}
        >
          <Image
            src={thumbnailUrl}
            alt={`Page ${pageNum}`}
            className="object-contain"
            fill
            unoptimized
          />
        </div>
        <div className="absolute top-1 left-1 z-10 bg-gray-900/75 dark:bg-gray-100/75 text-white dark:text-gray-900 text-xs rounded-full px-2 py-1 font-semibold">
          {pageNum}
        </div>
        {rotation !== 0 && (
          <div className="absolute top-1 right-1 z-10 bg-primary text-primary-foreground text-xs rounded-full px-2 py-1 font-semibold">
            {rotation}°
          </div>
        )}
      </div>
      <div className="flex items-center justify-center gap-2 w-full">
        <span className="font-medium text-sm text-foreground">{pageNum}</span>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-8 w-8 rounded-full"
          onClick={onRotate}
          disabled={disabled}
          aria-label={`Rotate page ${pageNum} 90° clockwise`}
          title="Rotate 90°"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
