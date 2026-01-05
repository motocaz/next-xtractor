import { ScrollToTop } from '@/components/ScrollToTop';
import SanitizePDFToolClient from './SanitizePDFToolClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sanitize PDF | Xtractor',
  description:
    'Remove potentially sensitive or unnecessary information from your PDF before sharing.',
};

export default function SanitizePage() {
  return (
    <>
      <ScrollToTop />
      <SanitizePDFToolClient />
    </>
  );
}

