import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function ProtectedPage() {
  const { has } = await auth();

  const hasPremiumPlan = has({ plan: 'premium' });

  if (!hasPremiumPlan) {
    return (
      <div className="min-h-screen container mx-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Premium Content
          </h1>
          <p className="text-gray-400 mb-8">
            This content is only available to Premium subscribers.
          </p>
          <Link href="/pricing">
            <Button className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white">
              View Plans
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
          Premium Content
        </h1>
        <div className="bg-tool-card rounded-lg border border-gray-700 p-8">
          <p className="text-gray-300">
            This is exclusive content for Premium subscribers. You have access
            to all premium features!
          </p>
        </div>
      </div>
    </div>
  );
}

