import { ScrollToTop } from '@/components/ScrollToTop';
import BookmarkToolClient from './BookmarkToolClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF Bookmark Editor | Xtractor',
  description: 'Edit and manage PDF bookmarks. Add, edit, delete, and organize bookmarks with custom destinations, colors, and styles.',
};

export default function BookmarksPage() {
  return (
    <>
      <ScrollToTop />
      <BookmarkToolClient />
    </>
  );
}

