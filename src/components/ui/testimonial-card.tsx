import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface TestimonialCardProps
  extends React.ComponentProps<typeof Card> {}

function TestimonialCard({ className, ...props }: TestimonialCardProps) {
  return (
    <Card
      className={cn(
        "bg-[#18181b] p-6 rounded-xl border-gray-700 flex flex-col",
        className
      )}
      {...props}
    />
  );
}

export { TestimonialCard };

