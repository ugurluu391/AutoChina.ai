"use client";
import { useState } from "react";
import Link from "next/link";
import { LogOut, LayoutDashboard, User as UserIcon, Store } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth-actions";

export function UserMenu({ name, role }: { name?: string | null; role?: string }) {
  const [open, setOpen] = useState(false);
  const initial = (name?.[0] ?? "U").toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-9 h-9 rounded-[10px] bg-grad-accent grid place-items-center font-display font-bold text-[#04121a] text-sm hover:scale-105 transition-transform"
      >
        {initial}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-52 rounded-[var(--radius-sm)] bg-bg-800 border border-[var(--border)] backdrop-blur-[14px] shadow-glow p-1.5">
            <div className="px-3 py-2.5 border-b border-[var(--border)] mb-1">
              <div className="text-sm font-semibold truncate">{name ?? "İstifadəçi"}</div>
              <div className="text-[11px] text-content-muted uppercase">{role ?? "USER"}</div>
            </div>
            <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-content-dim hover:text-content hover:bg-surface transition-colors">
              <LayoutDashboard size={15} /> Panel
            </Link>
            {(role === "SELLER" || role === "ADMIN") && (
              <Link href="/seller/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-content-dim hover:text-content hover:bg-surface transition-colors">
                <Store size={15} /> Satıcı paneli
              </Link>
            )}
            {role === "ADMIN" && (
              <Link href="/admin" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-content-dim hover:text-content hover:bg-surface transition-colors">
                <UserIcon size={15} /> Admin
              </Link>
            )}
            <form action={logoutAction}>
              <button type="submit" className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-300 hover:bg-red-500/10 transition-colors">
                <LogOut size={15} /> Çıxış
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
