"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Car, Calendar, MapPin, Cpu, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/marketplace/product-card";
import type { ProductCardData } from "@/types";

type Decoded = {
  vin: string; brand?: string; brandSlug?: string; year?: number; country?: string;
  model?: string; bodyType?: string; engineHint?: string;
  suggestedCategories?: string[]; confidence?: "high" | "medium" | "low"; aiNote?: string;
};
type Match = ProductCardData & { matchScore: number; matchReason: string };

const confLabel: Record<string, { t: string; v: "success" | "warning" | "accent" }> = {
  high: { t: "Yüksək dəqiqlik", v: "success" },
  medium: { t: "Orta dəqiqlik", v: "accent" },
  low: { t: "Aşağı dəqiqlik", v: "warning" },
};

export function VinDecoder() {
  const [vin, setVin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [decoded, setDecoded] = useState<Decoded | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);

  const decode = async () => {
    const clean = vin.trim().toUpperCase();
    if (clean.length !== 17) { setError("VIN tam 17 simvol olmalıdır"); return; }
    setError(""); setDecoded(null); setMatches([]); setLoading(true);
    try {
      const res = await fetch("/api/vin/decode", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vin: clean }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "VIN tanınmadı");
      setDecoded(data.decoded);
      setMatches(data.compatible ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const conf = decoded?.confidence ? confLabel[decoded.confidence] : null;

  return (
    <div className="space-y-6">
      {/* VIN input — floating search stilində (mövcud dizayn) */}
      <div className="max-w-[640px] mx-auto w-full">
        <div className="flex items-center gap-3 p-2 pl-4 rounded-2xl bg-[rgba(255,255,255,.05)] border border-[var(--border)] backdrop-blur-[14px] shadow-glow">
          {loading ? <Loader2 size={20} className="text-content-muted shrink-0 animate-spin" /> : <Search size={20} className="text-content-muted shrink-0" />}
          <input
            value={vin}
            onChange={(e) => setVin(e.target.value.toUpperCase().slice(0, 17))}
            onKeyDown={(e) => e.key === "Enter" && decode()}
            placeholder="VIN nömrəsini daxil edin (17 simvol)..."
            maxLength={17}
            className="flex-1 bg-transparent outline-none text-content text-[15px] tracking-wider font-mono placeholder:text-content-muted placeholder:font-body placeholder:tracking-normal min-w-0"
          />
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[rgba(168,85,247,.15)] text-[#d8b4fe] border border-[rgba(168,85,247,.3)]">
            <Sparkles size={11} /> AI
          </span>
          <Button onClick={decode} size="sm" disabled={loading}>Tani</Button>
        </div>
        {vin.length > 0 && vin.length < 17 && <p className="text-content-muted text-xs mt-2 text-center">{17 - vin.length} simvol qalıb</p>}
        {error && <p className="text-red-300 text-sm mt-2 text-center">{error}</p>}
      </div>

      {/* AI nəticə kartı — animasiyalı */}
      <AnimatePresence>
        {decoded && (
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0.7, 0.3, 1] }}
            className="max-w-[760px] mx-auto rounded-[var(--radius)] p-6 border border-[var(--border)] backdrop-blur-[12px] bg-[linear-gradient(135deg,rgba(34,211,238,.07),rgba(168,85,247,.07))]"
          >
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <div className="flex items-center gap-2 font-display font-semibold">
                <CheckCircle2 size={18} className="text-[var(--success)]" /> Avtomobil tanındı
              </div>
              {conf && <Badge variant={conf.v}>{conf.t}</Badge>}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Car, label: "Marka", value: decoded.brand ?? "Naməlum" },
                { icon: Sparkles, label: "Model", value: decoded.model ?? "—" },
                { icon: Calendar, label: "İl", value: decoded.year?.toString() ?? "—" },
                { icon: MapPin, label: "Ölkə", value: decoded.country ?? "—" },
              ].map((f, i) => (
                <motion.div key={f.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
                  className="p-3.5 rounded-[var(--radius-sm)] bg-surface border border-[var(--border)]">
                  <div className="flex items-center gap-1.5 text-content-muted text-xs mb-1.5"><f.icon size={13} /> {f.label}</div>
                  <div className="font-semibold text-sm">{f.value}</div>
                </motion.div>
              ))}
            </div>

            {(decoded.bodyType || decoded.engineHint) && (
              <div className="flex flex-wrap gap-2 mt-4">
                {decoded.bodyType && <Badge variant="accent">{decoded.bodyType}</Badge>}
                {decoded.engineHint && <Badge variant="violet"><Cpu size={11} /> {decoded.engineHint}</Badge>}
              </div>
            )}
            {decoded.aiNote && <p className="text-content-dim text-sm mt-4 flex items-start gap-1.5"><Sparkles size={13} className="text-accent mt-0.5 shrink-0" /> {decoded.aiNote}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uyğunluq kartları */}
      {matches.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="max-w-[1180px] mx-auto">
          <h3 className="font-display text-xl font-bold mb-5 flex items-center gap-2">
            <Sparkles size={20} className="text-accent" /> Uyğun ehtiyat hissələri
            <span className="text-content-muted text-sm font-body font-normal">({matches.length})</span>
          </h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
            {matches.map((m, i) => (
              <div key={m.id} className="relative">
                {/* Uyğunluq nişanı — ProductCard-ın üstündə overlay (kartı dəyişmədən) */}
                <div className="absolute top-3 right-12 z-20">
                  <Badge variant={m.matchScore >= 90 ? "success" : m.matchScore >= 70 ? "accent" : "warning"}>
                    {m.matchScore}% uyğun
                  </Badge>
                </div>
                <ProductCard product={m} index={i} />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {decoded && matches.length === 0 && !loading && (
        <div className="max-w-[760px] mx-auto p-8 rounded-[var(--radius)] bg-surface border border-dashed border-[var(--border)] text-center text-content-dim">
          Bu avtomobil üçün hələ uyğun hissə tapılmadı. Marketplace-də axtarış edə bilərsiniz.
        </div>
      )}
    </div>
  );
}
