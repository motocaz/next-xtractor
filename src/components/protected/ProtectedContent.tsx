"use client";

import { Protect } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ProtectedContentProps {
  plan: string;
  children: React.ReactNode;
  fallbackMessage?: string;
}

export const ProtectedContent = ({
  plan,
  children,
  fallbackMessage = "This content is only available to subscribers.",
}: ProtectedContentProps) => {
  return (
    <Protect
      plan={plan}
      fallback={
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <p className="text-muted-foreground mb-6">{fallbackMessage}</p>
          <Link href="/pricing">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
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
