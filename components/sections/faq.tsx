"use client";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { SectionHead } from "./section-head";

const faqs = [
  { q: "AI köməkçi necə işləyir?", a: "Maşının modelini, VIN kodunu və ya problemi yazırsan. AI uyğun hissələri, analoqları və ən sərfəli qiyməti tapıb təklif edir." },
  { q: "Hissələr orijinaldır?", a: "Hər məhsulda 'Orijinal', 'Analoq' və ya 'İşlənmiş' etiketi var. Satıcılar yoxlanılır və rəylər şəffafdır." },
  { q: "Çatdırılma necədir?", a: "Satıcıdan asılı olaraq Bakı daxili 1-2 gün, regionlara 2-4 gün. Hər məhsulda çatdırılma məlumatı göstərilir." },
  { q: "Qaytarma mümkündürmü?", a: "Bəli, uyğun gəlməyən və ya zədəli hissələri 14 gün ərzində qaytara bilərsən." },
  { q: "Satıcı necə olaram?", a: "Satıcı planına keçid et, mağaza profili yarat və məhsullarını yüklə. Analitika paneli ilə satışlarını izlə." },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="relative z-10 max-w-[760px] mx-auto px-5 py-14">
      <SectionHead eyebrow="FAQ" title="Tez-tez verilən suallar" />
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <div key={i} className="rounded-[var(--radius-sm)] bg-surface border border-[var(--border)] overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-4 p-5 text-left">
              <span className="font-semibold text-[15px]">{f.q}</span>
              {open === i ? <Minus size={18} className="text-accent shrink-0" /> : <Plus size={18} className="text-content-muted shrink-0" />}
            </button>
            {open === i && <div className="px-5 pb-5 text-content-dim text-sm leading-relaxed -mt-1">{f.a}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
