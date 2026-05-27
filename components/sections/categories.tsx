"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { SectionHead } from "./section-head";
import { MOCK_CATEGORIES } from "@/data/mock";

export function Categories() {
  return (
    <section className="relative z-10 max-w-[1180px] mx-auto px-5 py-14">
      <SectionHead eyebrow="Kateqoriyalar" title="Hissə kateqoriyaları" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {MOCK_CATEGORIES.map((c, i) => (
          <motion.div key={c.slug} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
            <Link href={`/marketplace?category=${c.slug}`} className="group flex flex-col gap-3 p-5 rounded-[var(--radius)] bg-surface border border-[var(--border)] transition-all hover:border-[var(--border-glow)] hover:-translate-y-1 hover:shadow-glow">
              <span className="text-4xl transition-transform group-hover:scale-110">{c.icon}</span>
              <span className="font-semibold text-[15px]">{c.name}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
