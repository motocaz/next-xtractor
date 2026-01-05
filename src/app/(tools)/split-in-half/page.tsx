import { ScrollToTop } from '@/components/ScrollToTop';
import SplitInHalfToolClient from './SplitInHalfToolClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Split Pages in Half | Xtractor',
  description:
    'Choose a method to divide every page of your document into two separate pages.',
};

export default function SplitInHalfPage() {
  return (
    <>
      <ScrollToTop />
      <SplitInHalfToolClient />
    </>
  );
}

