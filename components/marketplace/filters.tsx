"use client";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { MOCK_BRANDS, MOCK_CATEGORIES } from "@/data/mock";
import { Button } from "@/components/ui/button";

const conditions = [
  { value: "ORIGINAL", label: "Orijinal" },
  { value: "AFTERMARKET", label: "Analoq" },
  { value: "USED", label: "İşlənmiş" },
];

function FilterContent() {
  return (
    <div className="space-y-7">
      <div>
        <h4 className="font-display font-semibold text-sm mb-3">Marka</h4>
        <div className="space-y-2 max-h-52 overflow-auto pr-1">
          {MOCK_BRANDS.map((b) => (
            <label key={b.id} className="flex items-center gap-2.5 text-sm text-content-dim cursor-pointer hover:text-content">
              <input type="checkbox" className="accent-[var(--accent)] w-4 h-4" /> {b.name}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-display font-semibold text-sm mb-3">Kateqoriya</h4>
        <div className="space-y-2">
          {MOCK_CATEGORIES.map((c) => (
            <label key={c.slug} className="flex items-center gap-2.5 text-sm text-content-dim cursor-pointer hover:text-content">
              <input type="checkbox" className="accent-[var(--accent)] w-4 h-4" /> {c.icon} {c.name}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-display font-semibold text-sm mb-3">Vəziyyət</h4>
        <div className="space-y-2">
          {conditions.map((c) => (
            <label key={c.value} className="flex items-center gap-2.5 text-sm text-content-dim cursor-pointer hover:text-content">
              <input type="checkbox" className="accent-[var(--accent)] w-4 h-4" /> {c.label}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-display font-semibold text-sm mb-3">Qiymət (₼)</h4>
        <div className="flex gap-2">
          <input placeholder="Min" className="w-full bg-surface border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--border-glow)]" />
          <input placeholder="Max" className="w-full bg-surface border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--border-glow)]" />
        </div>
      </div>
      <Button className="w-full">Tətbiq et</Button>
    </div>
  );
}

export function Filters() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 p-5 rounded-[var(--radius)] bg-surface border border-[var(--border)]">
          <h3 className="font-display font-bold mb-5 flex items-center gap-2"><SlidersHorizontal size={16} /> Filterlər</h3>
          <FilterContent />
        </div>
      </aside>

      {/* Mobile toggle */}
      <Button variant="ghost" size="sm" className="lg:hidden mb-4" onClick={() => setOpen(true)}>
        <SlidersHorizontal size={15} /> Filterlər
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-bg-800 border-r border-[var(--border)] p-5 overflow-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold">Filterlər</h3>
              <button onClick={() => setOpen(false)}><X /></button>
            </div>
            <FilterContent />
          </div>
        </div>
      )}
    </>
  );
}
