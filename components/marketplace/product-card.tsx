"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/marketplace/favorite-button";
import { formatPrice } from "@/lib/utils";
import type { ProductCardData } from "@/types";

const conditionLabel: Record<string, { text: string; variant: "success" | "accent" | "violet" }> = {
  ORIGINAL: { text: "Orijinal", variant: "success" },
  AFTERMARKET: { text: "Analoq", variant: "accent" },
  USED: { text: "İşlənmiş", variant: "violet" },
};

const isUrl = (s: string) => s.startsWith("http") || s.startsWith("/");

export function ProductCard({
  product,
  index = 0,
  favorited = false,
}: {
  product: ProductCardData;
  index?: number;
  favorited?: boolean;
}) {
  const cond = conditionLabel[product.condition];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 8) * 0.05, ease: [0.2, 0.7, 0.3, 1] }}
    >
      <Link href={`/marketplace/${product.slug}`}>
        <div className="group relative rounded-[var(--radius)] bg-surface border border-[var(--border)] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--border-glow)] hover:shadow-glow cursor-pointer">
          {/* Şəkil zonası */}
          <div className="relative h-[170px] grid place-items-center overflow-hidden bg-[linear-gradient(135deg,#141a2b,#0b0f1a)]">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_30%,rgba(34,211,238,.15),transparent_70%)]" />
            {isUrl(product.image) ? (
              <Image
                src={product.image}
                alt={product.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 230px"
                loading="lazy"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <span className="text-5xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                {product.image}
              </span>
            )}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
              <Badge variant={cond.variant}>{cond.text}</Badge>
              {product.isVip && <Badge variant="warning">⭐ VIP</Badge>}
            </div>
            <FavoriteButton productId={product.id} initialFavorited={favorited} />
          </div>
          {/* Məlumat */}
          <div className="p-4">
            <div className="text-[12px] text-accent font-semibold font-display tracking-wide">
              {product.brandName.toUpperCase()} {product.carModel && `· ${product.carModel}`}
            </div>
            <div className="text-[15px] font-semibold mt-1.5 mb-1 leading-tight line-clamp-1">{product.title}</div>
            <div className="flex items-center justify-between mt-3.5">
              <div className="font-display text-[20px] font-bold flex items-baseline gap-1.5">
                {formatPrice(product.price)}
                {product.oldPrice && (
                  <span className="text-[13px] text-content-muted font-normal line-through">{formatPrice(product.oldPrice)}</span>
                )}
              </div>
              <div className="text-[13px] text-content-dim flex items-center gap-1">
                <Star size={13} className="fill-[var(--warning)] text-[var(--warning)]" /> {product.rating}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
