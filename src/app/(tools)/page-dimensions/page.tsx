import { ScrollToTop } from '@/components/ScrollToTop';
import { PageDimensionsTool } from '@/features/pdf-page-dimensions';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analyze Page Dimensions | Xtractor',
  description:
    'Analyze the dimensions, standard size, and orientation of every page in your PDF.',
};

export default function PageDimensionsPage() {
  return (
    <>
      <ScrollToTop />
      <PageDimensionsTool />
    </>
  );
}

