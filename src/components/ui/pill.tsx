import * as React from "react";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type VariantProps } from "class-variance-authority";

export interface PillProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Pill({ className, variant = "secondary", ...props }: PillProps) {
  return (
    <Badge
      className={cn(
        "bg-muted text-muted-foreground",
        "px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm",
        "font-medium",
        className,
      )}
      variant={variant}
      {...props}
    />
  );
}

export { Pill };
