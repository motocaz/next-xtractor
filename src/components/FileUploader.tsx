"use client";

import { useRef, useState, useCallback } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export interface FileUploaderProps {
  accept?: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
}

export const FileUploader = ({
  accept,
  multiple = false,
  onFilesSelected,
  disabled = false,
  className,
}: FileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFilesSelected(Array.from(files));
      }

      e.target.value = "";
    },
    [onFilesSelected]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onFilesSelected(files);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [disabled, onFilesSelected]
  );

  return (
    <label
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "w-full flex justify-center items-center px-6 py-10 bg-background text-muted-foreground rounded-lg border-2 border-dashed border-border",
        "hover:bg-accent hover:border-primary/50 cursor-pointer transition-colors",
        disabled &&
          "opacity-50 cursor-not-allowed hover:bg-background hover:border-border",
        isDragging && "border-primary bg-accent",
        className
      )}
    >
      <div className="text-center">
        <Upload className="mx-auto h-12 w-12 mb-2" />
        <span className="mt-2 block text-sm font-medium">
          Click to upload files
        </span>
        <span className="mt-1 block text-xs">
          {multiple ? "Any file type, multiple files allowed" : "Select a file"}
        </span>
      </div>
      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        disabled={disabled}
        className="sr-only"
        aria-label="File upload input"
      />
    </label>
  );
};

