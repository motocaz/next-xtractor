import { ScrollToTop } from '@/components/ScrollToTop';
import RemoveBlankPagesToolClient from './RemoveBlankPagesToolClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Remove Blank Pages | Xtractor',
  description:
    'Automatically detect and remove blank or nearly blank pages from your PDF. Adjust sensitivity to control what is considered "blank".',
};

export default function RemoveBlankPagesPage() {
  return (
    <>
      <ScrollToTop />
      <RemoveBlankPagesToolClient />
    </>
  );
}

