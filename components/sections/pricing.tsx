"use client";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { SectionHead } from "./section-head";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  { name: "Pulsuz", price: "₼0", period: "/ay", features: ["Marketplace girişi", "5 wishlist", "Əsas axtarış", "Topluluq dəstəyi"], cta: "Başla", featured: false },
  { name: "Premium", price: "₼19", period: "/ay", features: ["Limitsiz wishlist", "AI köməkçi (limitsiz)", "Qiymət bildirişləri", "Prioritet dəstək", "Topdan qiymətlər"], cta: "Premium al", featured: true },
  { name: "Satıcı", price: "₼49", period: "/ay", features: ["Mağaza profili", "Limitsiz məhsul", "Analitika paneli", "Promosyon alətləri", "API girişi"], cta: "Satıcı ol", featured: false },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative z-10 max-w-[1180px] mx-auto px-5 py-14">
      <SectionHead eyebrow="Qiymətlər" title="Sənə uyğun planı seç" />
      <div className="grid md:grid-cols-3 gap-5">
        {plans.map((p, i) => (
          <motion.div key={p.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className={`relative p-7 rounded-[var(--radius)] border transition-all ${p.featured ? "border-[var(--border-glow)] bg-[linear-gradient(135deg,rgba(34,211,238,.06),rgba(168,85,247,.06))] shadow-glow" : "border-[var(--border)] bg-surface"}`}>
            {p.featured && <div className="absolute -top-3 left-7"><Badge variant="violet">Ən populyar</Badge></div>}
            <div className="font-display font-semibold text-lg">{p.name}</div>
            <div className="mt-3 mb-5"><span className="font-display text-4xl font-bold">{p.price}</span><span className="text-content-muted text-sm">{p.period}</span></div>
            <ul className="space-y-3 mb-7">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-content-dim">
                  <Check size={16} className="text-accent shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Button variant={p.featured ? "primary" : "ghost"} className="w-full">{p.cta}</Button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
