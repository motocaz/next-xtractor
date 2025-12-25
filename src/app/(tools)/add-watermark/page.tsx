import { ScrollToTop } from '@/components/ScrollToTop';
import { AddWatermarkTool } from '@/features/add-watermark';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add Watermark to PDF | Xtractor',
  description: 'Add text or image watermarks to your PDF document with customizable options for opacity, angle, and styling.',
};

export default function AddWatermarkPage() {
  return (
    <>
      <ScrollToTop />
      <AddWatermarkTool />
    </>
  );
}

