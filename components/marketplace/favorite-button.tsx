"use client";
import { Heart } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFavorite } from "@/lib/actions/favorite-actions";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  productId,
  initialFavorited = false,
  variant = "card",
}: {
  productId: string;
  initialFavorited?: boolean;
  variant?: "card" | "detail";
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !favorited;
    setFavorited(next); // optimistik
    startTransition(async () => {
      const res = await toggleFavorite(productId);
      if (res.error) {
        setFavorited(!next); // geri qaytar
        if (res.error === "Daxil olun") router.push("/login");
      } else {
        setFavorited(res.favorited);
      }
    });
  };

  if (variant === "detail") {
    return (
      <button
        onClick={handle}
        disabled={pending}
        className="h-12 w-12 grid place-items-center rounded-[12px] bg-surface border border-[var(--border)] transition-all hover:border-[var(--border-glow)] disabled:opacity-60"
        aria-label="Favoritə əlavə et"
      >
        <Heart size={18} className={cn("transition-colors", favorited ? "fill-red-400 text-red-400" : "text-content-dim")} />
      </button>
    );
  }

  return (
    <button
      onClick={handle}
      disabled={pending}
      className="absolute top-3 right-3 w-8 h-8 rounded-[9px] grid place-items-center bg-black/40 border border-[var(--border)] backdrop-blur-sm transition-all hover:bg-red-500/20 hover:border-red-500/40 disabled:opacity-60"
      aria-label="Favoritə əlavə et"
    >
      <Heart size={15} className={cn("transition-colors", favorited ? "fill-red-400 text-red-400" : "text-content-dim")} />
    </button>
  );
}
