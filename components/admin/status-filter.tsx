"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function StatusFilter({ options }: { options: { value: string; label: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const active = params.get("status") ?? "";

  const set = (value: string) => {
    const p = new URLSearchParams(params.toString());
    if (value) p.set("status", value); else p.delete("status");
    router.push(`${pathname}?${p.toString()}`);
  };

  return (
    <div className="flex gap-1.5 flex-wrap">
      <button onClick={() => set("")} className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all", !active ? "bg-grad-accent text-[#04121a] border-transparent" : "bg-surface text-content-dim border-[var(--border)] hover:text-content")}>
        Hamısı
      </button>
      {options.map((o) => (
        <button key={o.value} onClick={() => set(o.value)} className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all", active === o.value ? "bg-grad-accent text-[#04121a] border-transparent" : "bg-surface text-content-dim border-[var(--border)] hover:text-content")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
