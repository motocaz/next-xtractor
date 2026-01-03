import { ScrollToTop } from '@/components/ScrollToTop';
import { EncryptPDFTool } from '@/features/pdf-encrypt';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Encrypt PDF | Xtractor',
  description:
    'Add 256-bit AES password protection to your PDF documents. Secure your PDFs with user and owner passwords.',
};

export default function EncryptPage() {
  return (
    <>
      <ScrollToTop />
      <EncryptPDFTool />
    </>
  );
}

