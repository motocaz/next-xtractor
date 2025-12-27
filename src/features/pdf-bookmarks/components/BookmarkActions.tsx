'use client';

import { Button } from '@/components/ui/button';
import { Download as DownloadIcon, FileSearch } from 'lucide-react';

interface BookmarkActionsProps {
  onSavePDF: () => void;
  onExtractExisting: () => void;
}

export const BookmarkActions = ({
  onSavePDF,
  onExtractExisting,
}: BookmarkActionsProps) => {
  return (
    <div className="space-y-2 mt-4">
      <Button variant="default" className="w-full" onClick={onSavePDF}>
        <DownloadIcon className="h-4 w-4 mr-2" />
        Save PDF with Bookmarks
      </Button>
      <Button variant="outline" className="w-full" onClick={onExtractExisting}>
        <FileSearch className="h-4 w-4 mr-2" />
        Extract Existing Bookmarks
      </Button>
    </div>
  );
};

