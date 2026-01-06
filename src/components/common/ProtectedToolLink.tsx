'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import type { ReactNode } from 'react';

interface ProtectedToolLinkProps {
  href: string;
  children: ReactNode;
  scroll?: boolean;
}

export const ProtectedToolLink = ({
  href,
  children,
  scroll = false,
}: ProtectedToolLinkProps) => {
  return (
    <>
      <SignedIn>
        <Link href={href} scroll={scroll}>
          {children}
        </Link>
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <div className="cursor-pointer">{children}</div>
        </SignInButton>
      </SignedOut>
    </>
  );
};

