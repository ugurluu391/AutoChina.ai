"use client";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { SectionHead } from "./section-head";

const data = [
  { name: "Elvin M.", role: "Chery Tiggo 7 sahibi", text: "AI köməkçi 2 dəqiqəyə düzgün əyləc dəstini tapdı. Servisdən 40% ucuz aldım.", rating: 5 },
  { name: "Günel A.", role: "BYD Song sahibi", text: "Orijinal hissə tapmaq problem idi. Burada satıcıları müqayisə edib rahat sifariş etdim.", rating: 5 },
  { name: "Rəşad H.", role: "Avtoservis sahibi", text: "Topdan alış üçün ideal platforma. Stok və qiymət şəffafdır, vaxt qənaət edirəm.", rating: 5 },
];

export function Testimonials() {
  return (
    <section className="relative z-10 max-w-[1180px] mx-auto px-5 py-14">
      <SectionHead eyebrow="Rəylər" title="İstifadəçilər nə deyir" />
      <div className="grid md:grid-cols-3 gap-5">
        {data.map((t, i) => (
          <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className="p-6 rounded-[var(--radius)] bg-surface border border-[var(--border)]">
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={15} className="fill-[var(--warning)] text-[var(--warning)]" />)}
            </div>
            <p className="text-content-dim text-[15px] leading-relaxed mb-4">"{t.text}"</p>
            <div className="font-semibold text-sm">{t.name}</div>
            <div className="text-content-muted text-[13px]">{t.role}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
