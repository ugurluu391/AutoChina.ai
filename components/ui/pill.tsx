import { cn } from "@/lib/utils";

export function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-[var(--border)] text-[13px] text-content-dim", className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] shadow-[0_0_10px_var(--success)]" />
      {children}
    </div>
  );
}
