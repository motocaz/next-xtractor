"use client";

import { Button } from "@/components/ui/button";

interface MobileViewToggleProps {
  showViewer: boolean;
  showBookmarks: boolean;
  onToggleViewer: () => void;
  onToggleBookmarks: () => void;
}

export const MobileViewToggle = ({
  showViewer,
  showBookmarks,
  onToggleViewer,
  onToggleBookmarks,
}: MobileViewToggleProps) => {
  return (
    <div className="lg:hidden bg-card border-b border-border">
      <div className="flex">
        <Button
          variant={showViewer ? "default" : "ghost"}
          className="flex-1 rounded-none"
          onClick={onToggleViewer}
        >
          PDF Viewer
        </Button>
        <Button
          variant={showBookmarks ? "default" : "ghost"}
          className="flex-1 rounded-none"
          onClick={onToggleBookmarks}
        >
          Bookmarks
        </Button>
      </div>
    </div>
  );
};
