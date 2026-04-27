import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Badge = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border border-amber/20 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-2 dark:border-amber/20 bg-amber/10 text-amber",
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = "Badge";
