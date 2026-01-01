import { ScrollToTop } from '@/components/ScrollToTop';
import CombineSinglePageToolClient from './CombineSinglePageToolClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Combine PDF to Single Page | Xtractor',
  description:
    'Stitch all pages of your PDF together vertically to create one continuous, scrollable page.',
};

export default function CombineSinglePagePage() {
  return (
    <>
      <ScrollToTop />
      <CombineSinglePageToolClient />
    </>
  );
}

