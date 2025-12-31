'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

interface BookmarkInputSectionProps {
  bookmarkTitle: string;
  currentPage: number;
  onTitleChange: (value: string) => void;
  onAddBookmark: () => void;
}

export const BookmarkInputSection = ({
  bookmarkTitle,
  currentPage,
  onTitleChange,
  onAddBookmark,
}: BookmarkInputSectionProps) => {
  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-4">
      <Input
        type="text"
        placeholder="Bookmark title..."
        value={bookmarkTitle}
        onChange={(e) => onTitleChange(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            onAddBookmark();
          }
        }}
        className="mb-2"
      />
      <Button variant="default" className="w-full" onClick={onAddBookmark}>
        <Plus className="h-4 w-4 mr-2" />
        Add to Page {currentPage}
      </Button>
    </div>
  );
};

