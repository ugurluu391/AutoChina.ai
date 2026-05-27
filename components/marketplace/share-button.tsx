"use client";
import { Share2, Check } from "lucide-react";
import { useState } from "react";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try { await navigator.share({ title, url }); return; } catch { /* user ləğv etdi */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <button
      onClick={share}
      className="h-12 w-12 grid place-items-center rounded-[12px] bg-surface border border-[var(--border)] transition-all hover:border-[var(--border-glow)]"
      aria-label="Paylaş"
    >
      {copied ? <Check size={18} className="text-[var(--success)]" /> : <Share2 size={18} className="text-content-dim" />}
    </button>
  );
}
