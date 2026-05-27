"use client";
import { useTransition } from "react";
import { ShieldCheck, ShieldOff, Loader2 } from "lucide-react";
import { toggleSellerVerified } from "@/lib/actions/admin-actions";
import { cn } from "@/lib/utils";

export function VerifyToggle({ sellerId, verified }: { sellerId: string; verified: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button onClick={() => start(() => { toggleSellerVerified(sellerId); })} disabled={pending}
      className={cn("inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all",
        verified ? "bg-surface text-content-dim border-[var(--border)] hover:border-[var(--border-glow)]" : "bg-[rgba(52,211,153,.12)] text-[var(--success)] border-[rgba(52,211,153,.3)] hover:bg-[rgba(52,211,153,.2)]")}>
      {pending ? <Loader2 size={12} className="animate-spin" /> : verified ? <ShieldOff size={12} /> : <ShieldCheck size={12} />}
      {verified ? "Təsdiqi geri al" : "Təsdiqlə"}
    </button>
  );
}
