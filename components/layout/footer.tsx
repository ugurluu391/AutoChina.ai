import Link from "next/link";
import { Zap } from "lucide-react";

const cols = [
  { title: "Platforma", links: ["Marketplace", "AI Köməkçi", "Satıcı ol", "Qiymətlər"] },
  { title: "Şirkət", links: ["Haqqımızda", "Bloq", "Karyera", "Əlaqə"] },
  { title: "Dəstək", links: ["Yardım mərkəzi", "Çatdırılma", "Qaytarma", "FAQ"] },
];

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-[var(--border)] mt-16">
      <div className="max-w-[1180px] mx-auto px-5 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 font-display font-bold text-[20px] mb-3">
              <span className="w-[30px] h-[30px] rounded-[9px] bg-grad-accent grid place-items-center">
                <Zap size={16} className="text-[#04121a]" fill="#04121a" />
              </span>
              AutoChina<span className="text-gradient">AI</span>
            </div>
            <p className="text-content-dim text-sm max-w-xs">
              Çin avtomobilləri üçün AI-powered ehtiyat hissələri marketplace-i. Azərbaycan.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="font-display font-semibold text-sm mb-3">{c.title}</div>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l}><Link href="#" className="text-content-dim text-sm hover:text-content transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-[var(--border)] mt-10 pt-6 text-content-muted text-sm flex flex-col md:flex-row justify-between gap-3">
          <span>© {new Date().getFullYear()} AutoChina AI. Bütün hüquqlar qorunur.</span>
          <span>Bakı, Azərbaycan 🇦🇿</span>
        </div>
      </div>
    </footer>
  );
}
