import { ScrollToTop } from '@/components/ScrollToTop';
import HeicToPdfToolClient from './HeicToPdfToolClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HEIC to PDF | Xtractor',
  description: 'Convert one or more HEIC (High Efficiency) images from your iPhone or camera into a single PDF file. Upload HEIC or HEIF images and create a PDF document with all images as pages.',
};

export default function HeicToPdfPage() {
  return (
    <>
      <ScrollToTop />
      <HeicToPdfToolClient />
    </>
  );
}

