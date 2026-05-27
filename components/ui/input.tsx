import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full bg-surface border border-[var(--border)] rounded-[var(--radius-sm)] px-4 py-3 text-sm text-content outline-none transition-colors placeholder:text-content-muted focus:border-[var(--border-glow)]",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-content-dim mb-1.5">{children}</label>;
}
