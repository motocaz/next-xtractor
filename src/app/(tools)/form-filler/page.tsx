import { ScrollToTop } from '@/components/ScrollToTop';
import FormFillerToolClient from './FormFillerToolClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF Form Filler | Xtractor',
  description:
    'Fill in PDF forms directly in your browser with live preview. Update form fields and see changes in real-time.',
};

export default function FormFillerPage() {
  return (
    <>
      <ScrollToTop />
      <FormFillerToolClient />
    </>
  );
}

