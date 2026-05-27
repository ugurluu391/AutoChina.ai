"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { SectionHead } from "./section-head";
import { MOCK_BRANDS } from "@/data/mock";

export function Brands() {
  return (
    <section id="brands" className="relative z-10 max-w-[1180px] mx-auto px-5 py-14">
      <SectionHead eyebrow="Dəstəklənən markalar" title="Çin avtomobil brendləri" />
      <div className="flex gap-3.5 flex-wrap">
        {MOCK_BRANDS.map((b, i) => (
          <motion.div key={b.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
            <Link href={`/marketplace?brand=${b.slug}`} className="block px-5 py-3.5 rounded-[14px] bg-surface border border-[var(--border)] font-display font-semibold text-[15px] text-content-dim transition-all hover:text-content hover:border-[var(--border-glow)] hover:bg-surface-2 hover:-translate-y-0.5">
              {b.name}
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
