"use client";
import { useState, useRef } from "react";
import { Sparkles, RefreshCw, Loader2, Check, Wand2, X } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseListingResponse } from "@/lib/parse-listing-client";

export type GeneratedListing = {
  title: string;
  description: string;
  salesPitch: string;
  hashtags: string[];
  keywords: string[];
};

export function AiListingGenerator({
  onApply,
  initialName = "",
}: {
  onApply?: (data: GeneratedListing) => void;
  initialName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ productName: initialName, brand: "", carModel: "", year: "" });
  const [streaming, setStreaming] = useState(false);
  const [rawText, setRawText] = useState("");
  const [result, setResult] = useState<GeneratedListing | null>(null);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const generate = async () => {
    if (form.productName.trim().length < 2) {
      setError("Məhsul adını daxil edin");
      return;
    }
    setError("");
    setResult(null);
    setRawText("");
    setStreaming(true);

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/ai/generate-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        signal: ctrl.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(typeof data.error === "string" ? data.error : "Generasiya alınmadı");
      }

      // Streaming oxu — typing effekti
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk.includes("__error")) {
          try { throw new Error(JSON.parse(chunk).__error); } catch (e) { throw e; }
        }
        acc += chunk;
        setRawText(acc);
      }

      // Tam mətni parse et → redaktə edilə bilən nəticə
      const parsed = parseListingResponse(acc);
      setResult(parsed);
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError((e as Error).message || "Xəta baş verdi");
      }
    } finally {
      setStreaming(false);
    }
  };

  const updateField = <K extends keyof GeneratedListing>(key: K, value: GeneratedListing[K]) => {
    setResult((r) => (r ? { ...r, [key]: value } : r));
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2.5 p-4 rounded-[var(--radius)] border border-dashed border-[rgba(168,85,247,.4)] bg-[linear-gradient(135deg,rgba(34,211,238,.06),rgba(168,85,247,.08))] text-[#d8b4fe] font-semibold text-sm transition-all hover:border-[rgba(168,85,247,.6)] hover:-translate-y-0.5"
      >
        <Sparkles size={17} /> AI ilə elan yarat
      </button>
    );
  }

  return (
    <div className="rounded-[var(--radius)] border border-[rgba(168,85,247,.3)] bg-[linear-gradient(135deg,rgba(34,211,238,.05),rgba(168,85,247,.07))] backdrop-blur-[12px] overflow-hidden">
      {/* Başlıq */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 font-display font-semibold text-sm">
          <span className="w-7 h-7 rounded-[8px] bg-grad-accent grid place-items-center"><Wand2 size={14} className="text-[#04121a]" /></span>
          AI Elan Generatoru
        </div>
        <button type="button" onClick={() => setOpen(false)} className="text-content-muted hover:text-content"><X size={18} /></button>
      </div>

      <div className="p-4 space-y-4">
        {/* Giriş sahələri */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Məhsul adı *</Label>
            <Input value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} placeholder="Ön əyləc disk" />
          </div>
          <div>
            <Label>Marka</Label>
            <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Chery" />
          </div>
          <div>
            <Label>Model</Label>
            <Input value={form.carModel} onChange={(e) => setForm({ ...form, carModel: e.target.value })} placeholder="Tiggo 7" />
          </div>
          <div>
            <Label>İl</Label>
            <Input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2023" />
          </div>
        </div>

        {error && <p className="text-[13px] text-red-300">{error}</p>}

        {/* Generate / Regenerate düyməsi */}
        <Button type="button" onClick={generate} disabled={streaming} className="w-full">
          {streaming ? (
            <><Loader2 size={16} className="animate-spin" /> AI yazır...</>
          ) : result ? (
            <><RefreshCw size={16} /> Yenidən yarat</>
          ) : (
            <><Sparkles size={16} /> Generasiya et</>
          )}
        </Button>

        {/* Streaming xam mətn (typing effekti) */}
        {streaming && rawText && (
          <div className="p-3.5 rounded-[var(--radius-sm)] bg-black/30 border border-[var(--border)] text-content-dim text-[13px] font-mono leading-relaxed max-h-48 overflow-auto">
            {rawText}
            <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-accent align-middle animate-pulse" />
          </div>
        )}

        {/* Redaktə edilə bilən nəticə */}
        {result && !streaming && (
          <div className="space-y-3.5 animate-rise">
            <div>
              <Label>SEO Başlıq</Label>
              <Input value={result.title} onChange={(e) => updateField("title", e.target.value)} />
            </div>
            <div>
              <Label>Təsvir</Label>
              <textarea
                value={result.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={4}
                className="w-full bg-surface border border-[var(--border)] rounded-[var(--radius-sm)] px-4 py-3 text-sm text-content outline-none focus:border-[var(--border-glow)] resize-none"
              />
            </div>
            <div>
              <Label>Satış mətni</Label>
              <textarea
                value={result.salesPitch}
                onChange={(e) => updateField("salesPitch", e.target.value)}
                rows={2}
                className="w-full bg-surface border border-[var(--border)] rounded-[var(--radius-sm)] px-4 py-3 text-sm text-content outline-none focus:border-[var(--border-glow)] resize-none"
              />
            </div>
            <div>
              <Label>Hashtag-lər</Label>
              <div className="flex flex-wrap gap-1.5">
                {result.hashtags.map((h, i) => (
                  <span key={i} className="text-[12px] px-2.5 py-1 rounded-lg bg-[rgba(168,85,247,.15)] text-[#d8b4fe] border border-[rgba(168,85,247,.3)]">{h}</span>
                ))}
              </div>
            </div>
            <div>
              <Label>Açar sözlər</Label>
              <div className="flex flex-wrap gap-1.5">
                {result.keywords.map((k, i) => (
                  <span key={i} className="text-[12px] px-2.5 py-1 rounded-lg bg-surface border border-[var(--border)] text-content-dim">{k}</span>
                ))}
              </div>
            </div>

            {onApply && (
              <Button type="button" variant="ghost" onClick={() => onApply(result)} className="w-full">
                <Check size={16} /> Formaya tətbiq et
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
