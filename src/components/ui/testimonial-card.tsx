import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface TestimonialCardProps extends React.ComponentProps<
  typeof Card
> {}

function TestimonialCard({ className, ...props }: TestimonialCardProps) {
  return (
    <Card
      className={cn(
        "bg-card p-6 rounded-xl border-border flex flex-col",
        className,
      )}
      {...props}
    />
  );
}

export { TestimonialCard };
