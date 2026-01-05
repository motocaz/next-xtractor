'use client';

import { FileCard } from './FileCard';

export interface FileListSectionProps {
  title: string;
  files: Array<{ id: string; fileName: string; fileSize: number }>;
  onRemove: (id: string) => void;
  disabled?: boolean;
  showIcon?: boolean;
  className?: string;
}

export const FileListSection = ({
  title,
  files,
  onRemove,
  disabled = false,
  showIcon = true,
  className,
}: FileListSectionProps) => {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-foreground mb-3">
        {title} ({files.length})
      </h3>
      <div className="space-y-2">
        {files.map((fileInfo) => (
          <FileCard
            key={fileInfo.id}
            fileName={fileInfo.fileName}
            fileSize={fileInfo.fileSize}
            onRemove={() => onRemove(fileInfo.id)}
            disabled={disabled}
            showIcon={showIcon}
          />
        ))}
      </div>
    </div>
  );
};

