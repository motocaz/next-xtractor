"use client";

import dynamic from "next/dynamic";

const BookmarkTool = dynamic(
  () =>
    import("@/features/pdf-bookmarks").then((mod) => ({
      default: mod.BookmarkTool,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading PDF Bookmark Editor...</p>
        </div>
      </div>
    ),
  },
);

export default BookmarkTool;
