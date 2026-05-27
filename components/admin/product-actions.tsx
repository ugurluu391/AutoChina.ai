"use client";
import { useTransition } from "react";
import { Check, X, Star, Trash2, Loader2 } from "lucide-react";
import { approveProduct, rejectProduct, toggleFeatured, adminDeleteProduct } from "@/lib/actions/admin-actions";
import { cn } from "@/lib/utils";

export function ApproveButtons({ productId, status }: { productId: string; status: string }) {
  const [pending, start] = useTransition();
  if (status !== "PENDING") return null;
  return (
    <div className="flex gap-1.5">
      <button onClick={() => start(() => { approveProduct(productId); })} disabled={pending}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[rgba(52,211,153,.12)] text-[var(--success)] border border-[rgba(52,211,153,.3)] hover:bg-[rgba(52,211,153,.2)]">
        {pending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Təsdiq
      </button>
      <button onClick={() => start(() => { rejectProduct(productId); })} disabled={pending}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-500/12 text-red-300 border border-red-500/30 hover:bg-red-500/20">
        <X size={12} /> Rədd
      </button>
    </div>
  );
}

export function FeaturedToggle({ productId, featured }: { productId: string; featured: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button onClick={() => start(() => { toggleFeatured(productId); })} disabled={pending}
      className={cn("w-8 h-8 grid place-items-center rounded-lg border transition-all",
        featured ? "bg-[rgba(251,191,36,.15)] border-[rgba(251,191,36,.4)]" : "bg-surface border-[var(--border)] hover:border-[var(--border-glow)]")}
      title="Seçilmiş">
      {pending ? <Loader2 size={13} className="animate-spin text-content-dim" /> : <Star size={14} className={featured ? "fill-[var(--warning)] text-[var(--warning)]" : "text-content-muted"} />}
    </button>
  );
}

export function AdminDeleteButton({ productId }: { productId: string }) {
  const [pending, start] = useTransition();
  return (
    <button onClick={() => { if (confirm("Bu məhsulu silmək istədiyinizə əminsiniz?")) start(() => { adminDeleteProduct(productId); }); }}
      disabled={pending}
      className="w-8 h-8 grid place-items-center rounded-lg bg-surface border border-[var(--border)] hover:bg-red-500/15 hover:border-red-500/40 transition-all" title="Sil">
      {pending ? <Loader2 size={13} className="animate-spin text-content-dim" /> : <Trash2 size={14} className="text-content-dim" />}
    </button>
  );
}
