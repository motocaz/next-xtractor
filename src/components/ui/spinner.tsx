import * as React from "react";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-8 h-8 border-[3px]",
    md: "w-16 h-16 border-[5px]",
    lg: "w-24 h-24 border-[6px]",
  };

  return (
    <div
      className={cn(
        "border-gray-700 border-b-fuchsia-600 rounded-full inline-block box-border animate-spin",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}

export { Spinner };

