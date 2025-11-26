import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";

export interface CTAButtonProps
  extends React.ComponentProps<typeof Button>,
    VariantProps<typeof buttonVariants> {}

function CTAButton({ className, ...props }: CTAButtonProps) {
  return (
    <Button
      className={cn(
        "bg-fuchsia-600 text-white font-semibold",
        "px-6 py-3 rounded-lg",
        "transition-colors duration-200",
        "hover:bg-fuchsia-700",
        className
      )}
      {...props}
    />
  );
}

export { CTAButton };

