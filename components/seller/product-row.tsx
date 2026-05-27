"use client";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Trash2, Eye, Loader2 } from "lucide-react";
import { useTransition, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { deleteProduct } from "@/lib/actions/product-actions";
import { formatPrice } from "@/lib/utils";

const isUrl = (s: string) => s.startsWith("http") || s.startsWith("/");
const statusMap: Record<string, { t: string; v: "success" | "warning" | "violet" | "accent" }> = {
  ACTIVE: { t: "Aktiv", v: "success" },
  DRAFT: { t: "Qaralama", v: "warning" },
  PENDING: { t: "Gözləyir", v: "accent" },
  SOLD: { t: "Satılıb", v: "violet" },
  ARCHIVED: { t: "Arxiv", v: "warning" },
};

export function ProductRow({ product }: {
  product: { id: string; slug: string; title: string; price: number; views: number; status: string; image: string };
}) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const st = statusMap[product.status] ?? statusMap.ACTIVE;

  return (
    <div className="flex items-center gap-4 p-3.5 rounded-[var(--radius-sm)] bg-surface border border-[var(--border)]">
      <div className="w-14 h-14 rounded-[10px] bg-bg-700 grid place-items-center overflow-hidden shrink-0">
        {isUrl(product.image)
          ? <Image src={product.image} alt="" width={56} height={56} className="w-full h-full object-cover" />
          : <span className="text-2xl">{product.image}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">{product.title}</div>
        <div className="flex items-center gap-3 mt-1 text-xs text-content-muted">
          <span className="font-display font-semibold text-content-dim">{formatPrice(product.price)}</span>
          <span className="flex items-center gap-1"><Eye size={12} /> {product.views}</span>
          <Badge variant={st.v}>{st.t}</Badge>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <Link href={`/marketplace/${product.slug}`} className="w-9 h-9 grid place-items-center rounded-[10px] bg-surface border border-[var(--border)] hover:border-[var(--border-glow)] transition-all" aria-label="Bax">
          <Eye size={15} className="text-content-dim" />
        </Link>
        <Link href={`/seller/products/${product.id}/edit`} className="w-9 h-9 grid place-items-center rounded-[10px] bg-surface border border-[var(--border)] hover:border-[var(--border-glow)] transition-all" aria-label="Redaktə">
          <Pencil size={15} className="text-content-dim" />
        </Link>
        {confirming ? (
          <button
            onClick={() => startTransition(() => deleteProduct(product.id))}
            disabled={pending}
            className="h-9 px-3 grid place-items-center rounded-[10px] bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold transition-all"
          >
            {pending ? <Loader2 size={14} className="animate-spin" /> : "Təsdiq et"}
          </button>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="w-9 h-9 grid place-items-center rounded-[10px] bg-surface border border-[var(--border)] hover:bg-red-500/15 hover:border-red-500/40 transition-all"
            aria-label="Sil"
          >
            <Trash2 size={15} className="text-content-dim" />
          </button>
        )}
      </div>
    </div>
  );
}
