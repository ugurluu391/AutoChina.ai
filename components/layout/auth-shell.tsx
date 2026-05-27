import Link from "next/link";
import { Zap } from "lucide-react";

export function AuthShell({ title, subtitle, children, footer }: {
  title: string; subtitle: string; children: React.ReactNode; footer: React.ReactNode;
}) {
  return (
    <main className="relative z-10 min-h-screen grid place-items-center px-5 py-10">
      <div className="w-full max-w-[420px]">
        <Link href="/" className="flex items-center justify-center gap-2.5 font-display font-bold text-[22px] mb-8">
          <span className="w-9 h-9 rounded-[10px] bg-grad-accent grid place-items-center shadow-[0_0_18px_rgba(34,211,238,.5)]">
            <Zap size={18} className="text-[#04121a]" fill="#04121a" />
          </span>
          AutoChina<span className="text-gradient">AI</span>
        </Link>
        <div className="p-7 rounded-[var(--radius)] bg-surface border border-[var(--border)] backdrop-blur-[14px] shadow-glow">
          <h1 className="font-display text-2xl font-bold text-center">{title}</h1>
          <p className="text-content-dim text-sm text-center mt-2 mb-7">{subtitle}</p>
          {children}
        </div>
        <p className="text-center text-content-dim text-sm mt-6">{footer}</p>
      </div>
    </main>
  );
}
