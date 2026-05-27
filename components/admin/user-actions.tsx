"use client";
import { useTransition } from "react";
import { Ban, ShieldCheck, Loader2 } from "lucide-react";
import { toggleBanUser, changeUserRole } from "@/lib/actions/admin-actions";
import { cn } from "@/lib/utils";

export function BanButton({ userId, banned, isAdmin }: { userId: string; banned: boolean; isAdmin: boolean }) {
  const [pending, start] = useTransition();
  if (isAdmin) return <span className="text-content-muted text-xs">—</span>;
  return (
    <button
      onClick={() => start(() => { toggleBanUser(userId); })}
      disabled={pending}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all",
        banned
          ? "bg-[rgba(52,211,153,.12)] text-[var(--success)] border-[rgba(52,211,153,.3)]"
          : "bg-red-500/12 text-red-300 border-red-500/30 hover:bg-red-500/20"
      )}
    >
      {pending ? <Loader2 size={12} className="animate-spin" /> : banned ? <ShieldCheck size={12} /> : <Ban size={12} />}
      {banned ? "Banı qaldır" : "Ban et"}
    </button>
  );
}

export function RoleSelect({ userId, role }: { userId: string; role: string }) {
  const [pending, start] = useTransition();
  return (
    <select
      defaultValue={role}
      disabled={pending}
      onChange={(e) => start(() => { changeUserRole(userId, e.target.value as "USER" | "SELLER" | "ADMIN"); })}
      className="bg-surface border border-[var(--border)] rounded-lg px-2 py-1 text-xs outline-none focus:border-[var(--border-glow)]"
    >
      <option value="USER">User</option>
      <option value="SELLER">Seller</option>
      <option value="ADMIN">Admin</option>
    </select>
  );
}
