"use client";
import { Search } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";

export function AdminSearch({ placeholder = "Axtar..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  const submit = (value: string) => {
    const p = new URLSearchParams(params.toString());
    if (value) p.set("q", value); else p.delete("q");
    router.push(`${pathname}?${p.toString()}`);
  };

  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-[var(--radius-sm)] bg-surface border border-[var(--border)] max-w-sm w-full focus-within:border-[var(--border-glow)] transition-colors">
      <Search size={16} className="text-content-muted shrink-0" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit(q)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm text-content placeholder:text-content-muted min-w-0"
      />
    </div>
  );
}
