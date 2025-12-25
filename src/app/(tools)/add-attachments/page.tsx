import { ScrollToTop } from '@/components/ScrollToTop';
import { AddAttachmentsTool } from '@/features/add-attachments';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add Attachments to PDF | Xtractor',
  description: 'Embed one or more files into your PDF document. Attach images, documents, spreadsheets, and more.',
};

export default function AddAttachmentsPage() {
  return (
    <>
      <ScrollToTop />
      <AddAttachmentsTool />
    </>
  );
}

