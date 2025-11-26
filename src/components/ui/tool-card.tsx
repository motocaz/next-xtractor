import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ToolCardProps
  extends React.ComponentProps<typeof Card> {}

function ToolCard({ className, ...props }: ToolCardProps) {
  return (
    <Card
      className={cn(
        "bg-[#18181b] border-gray-700",
        "transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-lg hover:border-fuchsia-600",
        className
      )}
      {...props}
    />
  );
}

export { ToolCard };

