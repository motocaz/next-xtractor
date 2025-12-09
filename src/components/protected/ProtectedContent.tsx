'use client';

import { Protect } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ProtectedContentProps {
  plan: string;
  children: React.ReactNode;
  fallbackMessage?: string;
}

export const ProtectedContent = ({
  plan,
  children,
  fallbackMessage = 'This content is only available to subscribers.',
}: ProtectedContentProps) => {
  return (
    <Protect
      plan={plan}
      fallback={
        <div className="bg-tool-card rounded-lg border border-gray-700 p-8 text-center">
          <p className="text-gray-400 mb-6">{fallbackMessage}</p>
          <Link href="/pricing">
            <Button className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white">
              View Plans
            </Button>
          </Link>
        </div>
      }
    >
      {children}
    </Protect>
  );
};

