import { ScrollToTop } from '@/components/ScrollToTop';
import { ChangePermissionsTool } from '@/features/change-permissions';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Change PDF Permissions | Xtractor',
  description:
    'Modify passwords and permissions on your PDF documents without losing quality. Encrypt, decrypt, and control access to your PDFs.',
};

export default function ChangePermissionsPage() {
  return (
    <>
      <ScrollToTop />
      <ChangePermissionsTool />
    </>
  );
}

