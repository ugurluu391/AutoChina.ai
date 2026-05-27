"use client";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Menu, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/user-menu";

const links = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/vin", label: "VIN ilə tap" },
  { href: "/#ai", label: "AI Köməkçi" },
  { href: "/#brands", label: "Markalar" },
  { href: "/#pricing", label: "Qiymətlər" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-[18px] backdrop-saturate-150 bg-[rgba(8,10,18,.6)] border-b border-[var(--border)]">
      <div className="max-w-[1180px] mx-auto px-5 h-[68px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-display font-bold text-[20px] tracking-wide">
          <span className="w-[34px] h-[34px] rounded-[10px] bg-grad-accent grid place-items-center shadow-[0_0_18px_rgba(34,211,238,.5)]">
            <Zap size={18} className="text-[#04121a]" fill="#04121a" />
          </span>
          AutoChina<span className="text-gradient">AI</span>
        </Link>

        <div className="hidden md:flex gap-7 items-center">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="relative text-[14px] font-medium text-content-dim hover:text-content transition-colors group">
              {l.label}
              <span className="absolute left-0 -bottom-1.5 h-0.5 w-0 bg-grad-accent transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="hidden md:flex gap-3 items-center">
          {user ? (
            <UserMenu name={user.name} role={(user as { role?: string }).role} />
          ) : (
            <>
              <Link href="/login"><Button variant="ghost" size="sm">Daxil ol</Button></Link>
              <Link href="/register"><Button size="sm">Başla</Button></Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((o) => !o)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden px-5 pb-5 flex flex-col gap-3 border-t border-[var(--border)] pt-4">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-content-dim py-1">{l.label}</Link>
          ))}
          <div className="flex gap-3 pt-2">
            {user ? (
              <Link href="/dashboard" className="flex-1"><Button size="sm" className="w-full">Panelim</Button></Link>
            ) : (
              <>
                <Link href="/login" className="flex-1"><Button variant="ghost" size="sm" className="w-full">Daxil ol</Button></Link>
                <Link href="/register" className="flex-1"><Button size="sm" className="w-full">Başla</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
