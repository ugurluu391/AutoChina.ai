"use client";
import { Search, Zap, Loader2 } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Suggestion = { title: string; slug: string };

export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const [q, setQ] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const submit = (term = q) => {
    setOpen(false);
    router.push(`/marketplace?q=${encodeURIComponent(term)}`);
  };

  const fetchSuggestions = useCallback((value: string) => {
    clearTimeout(debounce.current);
    if (value.trim().length < 2) {
      setSuggestions([]); setOpen(false); return;
    }
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        setSuggestions(data.suggestions ?? []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 250);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="max-w-[640px] mx-auto w-full relative" ref={boxRef}>
      <div className="flex items-center gap-3 p-2 pl-4 rounded-2xl bg-[rgba(255,255,255,.05)] border border-[var(--border)] backdrop-blur-[14px] shadow-glow">
        {loading ? (
          <Loader2 size={20} className="text-content-muted shrink-0 animate-spin" />
        ) : (
          <Search size={20} className="text-content-muted shrink-0" />
        )}
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); fetchSuggestions(e.target.value); }}
          onFocus={() => suggestions.length && setOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Məs: BYD Song Plus üçün ön əyləc bəndi..."
          className="flex-1 bg-transparent outline-none text-content text-[15px] placeholder:text-content-muted min-w-0"
        />
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[rgba(168,85,247,.15)] text-[#d8b4fe] border border-[rgba(168,85,247,.3)]">
          <Zap size={11} /> AI
        </span>
        <Button onClick={() => submit()} size="sm">Axtar</Button>
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-bg-800 border border-[var(--border)] backdrop-blur-[14px] shadow-glow overflow-hidden p-1.5">
          {suggestions.map((s) => (
            <button
              key={s.slug}
              onClick={() => router.push(`/marketplace/${s.slug}`)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-sm text-content-dim hover:text-content hover:bg-surface transition-colors"
            >
              <Search size={14} className="text-content-muted shrink-0" />
              <span className="truncate">{s.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
