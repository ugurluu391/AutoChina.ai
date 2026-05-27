"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashSidebar({ items, brand }: { items: { href: string; label: string; icon: React.ElementType }[]; brand: string }) {
  const path = usePathname();
  return (
    <aside className="w-60 shrink-0 hidden md:flex flex-col gap-1 p-4 border-r border-[var(--border)] min-h-screen sticky top-0">
      <Link href="/" className="flex items-center gap-2.5 font-display font-bold text-[18px] mb-6 px-2 pt-2">
        <span className="w-8 h-8 rounded-[9px] bg-grad-accent grid place-items-center"><Zap size={15} className="text-[#04121a]" fill="#04121a" /></span>
        {brand}
      </Link>
      {items.map((it) => {
        const active = path === it.href;
        return (
          <Link key={it.href} href={it.href} className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm transition-colors",
            active ? "bg-surface-2 text-content border border-[var(--border-glow)]" : "text-content-dim hover:text-content hover:bg-surface"
          )}>
            <it.icon size={17} /> {it.label}
          </Link>
        );
      })}
    </aside>
  );
}
