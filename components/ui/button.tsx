"use client";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-body font-semibold rounded-[12px] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
  {
    variants: {
      variant: {
        primary:
          "bg-grad-accent text-[#04121a] shadow-[0_8px_24px_-6px_rgba(34,211,238,.5)] hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-6px_rgba(34,211,238,.65)]",
        ghost:
          "bg-surface text-content border border-[var(--border)] hover:bg-surface-2 hover:border-[var(--border-glow)] hover:-translate-y-0.5",
        outline:
          "bg-transparent text-content border border-[var(--border)] hover:border-[var(--border-glow)]",
        danger:
          "bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25",
      },
      size: {
        sm: "h-9 px-4 text-[13px]",
        md: "h-11 px-5 text-[14px]",
        lg: "h-12 px-7 text-[15px]",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";
