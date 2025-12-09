import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface FeatureCardProps
  extends React.ComponentProps<typeof Card> {}

function FeatureCard({ className, ...props }: FeatureCardProps) {
  return (
    <Card
      className={cn(
        "bg-card p-6 rounded-lg text-center",
        className
      )}
      {...props}
    />
  );
}

export { FeatureCard };

