import { ScrollToTop } from '@/components/ScrollToTop';
import { FlattenPDFTool } from '@/features/pdf-flatten';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Flatten PDF | Xtractor',
  description:
    'Make PDF forms and annotations non-editable by flattening them. Convert interactive form fields into static content.',
};

export default function FlattenPage() {
  return (
    <>
      <ScrollToTop />
      <FlattenPDFTool />
    </>
  );
}

