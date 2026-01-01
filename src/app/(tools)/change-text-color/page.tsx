import { ScrollToTop } from '@/components/ScrollToTop';
import ChangeTextColorToolClient from './ChangeTextColorToolClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Change PDF Text Color | Xtractor',
  description:
    'Change the color of dark text in your PDF documents. This process converts pages to images, so text will not be selectable in the final file.',
};

export default function ChangeTextColorPage() {
  return (
    <>
      <ScrollToTop />
      <ChangeTextColorToolClient />
    </>
  );
}

