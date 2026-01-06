import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ToolAccessDenied } from '@/components/protected/ToolAccessDenied';
import { checkSubscriptionAccess } from '@/lib/auth/subscription-check';

export default async function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const { hasAccess } = await checkSubscriptionAccess(userId);

  if (!hasAccess) {
    return <ToolAccessDenied />;
  }

  return <>{children}</>;
}

