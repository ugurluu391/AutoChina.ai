"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { SearchBar } from "@/components/marketplace/search-bar";

const fade = (d: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay: d, ease: [0.2, 0.7, 0.3, 1] as const },
});

export function Hero() {
  return (
    <section className="relative z-10 text-center px-5 pt-[90px] pb-16 max-w-[1180px] mx-auto">
      <motion.div {...fade(0.05)} className="flex justify-center">
        <Pill>AI ilə düzgün hissəni 3 saniyəyə tap</Pill>
      </motion.div>
      <motion.h1 {...fade(0.15)} className="font-display font-bold leading-[1.02] tracking-tight mt-6 text-[clamp(38px,7vw,76px)]">
        Çin avtomobilləri üçün<br />
        <span className="text-gradient">ağıllı ehtiyat hissələri</span>
      </motion.h1>
      <motion.p {...fade(0.25)} className="max-w-[560px] mx-auto mt-6 mb-8 text-content-dim text-[17px]">
        Chery, Geely, BYD, Haval və daha çoxu. AI köməkçisi maşınının modelinə uyğun orijinal hissəni tapır, qiyməti müqayisə edir.
      </motion.p>
      <motion.div {...fade(0.35)} className="flex gap-3.5 justify-center flex-wrap">
        <Link href="/marketplace"><Button size="lg">Marketplace-ə keç →</Button></Link>
        <Link href="/#ai"><Button variant="ghost" size="lg"><Zap size={16} /> AI ilə soruş</Button></Link>
      </motion.div>
      <motion.div {...fade(0.45)} className="mt-10">
        <SearchBar />
      </motion.div>
    </section>
  );
}
