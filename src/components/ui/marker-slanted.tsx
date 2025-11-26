import * as React from "react";
import { cn } from "@/lib/utils";

export interface MarkerSlantedProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

function MarkerSlanted({
  className,
  children,
  ...props
}: MarkerSlantedProps) {
  return (
    <span
      className={cn(
        "relative inline-block",
        "before:content-[''] before:absolute before:left-0 before:right-0 before:bottom-0 before:h-1.5",
        "before:bg-gradient-to-br before:from-fuchsia-500 before:to-fuchsia-700",
        "before:-z-10 before:skew-x-[-20deg]",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { MarkerSlanted };

