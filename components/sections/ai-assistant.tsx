"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AiAssistant() {
  return (
    <section id="ai" className="relative z-10 max-w-[1180px] mx-auto px-5 py-14">
      <div className="relative rounded-[24px] p-8 md:p-10 overflow-hidden border border-[var(--border)] backdrop-blur-[12px] bg-[linear-gradient(135deg,rgba(34,211,238,.08),rgba(168,85,247,.08))]">
        <div className="absolute -top-1/2 -right-[10%] w-[400px] h-[400px] pointer-events-none bg-[radial-gradient(circle,rgba(34,211,238,.18),transparent_70%)]" />
        <div className="relative grid md:grid-cols-2 gap-8 md:gap-10 items-center">
          <div>
            <div className="font-display text-[13px] tracking-[2px] uppercase text-accent font-semibold">AI Köməkçi</div>
            <h2 className="font-display text-[32px] font-bold mt-2.5 mb-4">Maşınını de — hissəni tapım</h2>
            <p className="text-content-dim mb-6">
              VIN kodu, model və ya problemi yaz. AI sənə uyğun hissəni, alternativləri və ən yaxşı qiyməti təklif edir.
            </p>
            <Link href="/vin"><Button><Zap size={16} /> VIN ilə hissə tap</Button></Link>
          </div>
          <div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="ml-10 mb-3 p-3.5 rounded-[14px] backdrop-blur-sm bg-[rgba(34,211,238,.1)] border border-[rgba(34,211,238,.25)]">
              <div className="text-[11px] text-content-muted mb-1 font-semibold">Sən</div>
              <span className="text-sm">Tiggo 8 Pro-da arxa amortizator səs verir, nə lazımdır?</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="p-3.5 rounded-[14px] backdrop-blur-sm bg-black/30 border border-[var(--border)]">
              <div className="text-[11px] text-content-muted mb-1 font-semibold flex items-center gap-1"><Zap size={11} className="text-accent" /> AutoChina AI</div>
              <span className="text-sm">Arxa amortizator dəsti tövsiyə edirəm. 3 satıcıda var, ən sərfəli ₼180. Quraşdırma videosu da əlavə edim?</span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
