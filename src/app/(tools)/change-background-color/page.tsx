import { ScrollToTop } from '@/components/ScrollToTop';
import { ChangeBackgroundColorTool } from '@/features/change-background-color';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Change Background Color | Xtractor',
  description: 'Change the background color of every page in your PDF document with a simple color picker.',
};

export default function ChangeBackgroundColorPage() {
  return (
    <>
      <ScrollToTop />
      <ChangeBackgroundColorTool />
    </>
  );
}

