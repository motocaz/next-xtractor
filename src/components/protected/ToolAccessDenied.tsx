import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

export const ToolAccessDenied = () => {
  return (
    <div className="min-h-screen container mx-auto p-4 md:p-8">
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-primary/10 p-4">
            <Lock className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Subscription Required
        </h1>
        <p className="text-muted-foreground mb-4 text-lg">
          To access our PDF tools, you need an active subscription.
        </p>
        <p className="text-muted-foreground mb-8">
          Start your free trial or choose a plan to unlock all features and start
          processing your PDFs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/pricing">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              View Plans & Start Trial
            </Button>
          </Link>
          <Link href="/">
            <Button
              size="lg"
              variant="outline"
              className="border-border hover:bg-accent"
            >
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

