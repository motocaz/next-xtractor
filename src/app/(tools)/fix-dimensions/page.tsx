import { ScrollToTop } from '@/components/ScrollToTop';
import { FixDimensionsTool } from '@/features/fix-dimensions';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Standardize Page Dimensions | Xtractor',
  description:
    'Convert all pages in your PDF to a uniform size. Choose a standard format or define a custom dimension with options for orientation, scaling mode, and background color.',
};

export default function FixDimensionsPage() {
  return (
    <>
      <ScrollToTop />
      <FixDimensionsTool />
    </>
  );
}

