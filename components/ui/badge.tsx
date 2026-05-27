import { cn } from "@/lib/utils";

type Variant = "success" | "accent" | "violet" | "warning";

const variants: Record<Variant, string> = {
  success: "bg-[rgba(52,211,153,.15)] text-[var(--success)] border-[rgba(52,211,153,.3)]",
  accent: "bg-[rgba(34,211,238,.12)] text-[var(--accent)] border-[rgba(34,211,238,.3)]",
  violet: "bg-[rgba(168,85,247,.15)] text-[#d8b4fe] border-[rgba(168,85,247,.3)]",
  warning: "bg-[rgba(251,191,36,.15)] text-[var(--warning)] border-[rgba(251,191,36,.3)]",
};

export function Badge({
  children,
  variant = "accent",
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border backdrop-blur-sm",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
