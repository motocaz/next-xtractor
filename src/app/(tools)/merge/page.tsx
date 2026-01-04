import { ScrollToTop } from '@/components/ScrollToTop';
import { MergePDFTool } from '@/features/pdf-merge';

export const dynamic = 'force-dynamic';

export default function MergePage() {
  return (
    <>
      <ScrollToTop />
      <MergePDFTool />
    </>
  );
}

