import { ScrollToTop } from '@/components/ScrollToTop';
import { ExtractAttachmentsTool } from '@/features/extract-attachments';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Extract Attachments from PDF | Xtractor',
  description:
    'Extract all embedded files from one or more PDF documents. All attachments are packaged into a ZIP file for easy download.',
};

export default function ExtractAttachmentsPage() {
  return (
    <>
      <ScrollToTop />
      <ExtractAttachmentsTool />
    </>
  );
}

