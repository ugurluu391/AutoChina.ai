"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { ProductCard } from "./product-card";
import type { ProductCardData } from "@/types";

const PAGE = 8;

export function ProductGrid({ products, favoriteIds = [] }: { products: ProductCardData[]; favoriteIds?: string[] }) {
  const [visible, setVisible] = useState(PAGE);
  const sentinel = useRef<HTMLDivElement>(null);
  const favSet = new Set(favoriteIds);

  const loadMore = useCallback(() => {
    setVisible((v) => Math.min(v + PAGE, products.length));
  }, [products.length]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const obs = new IntersectionObserver((e) => e[0].isIntersecting && loadMore(), { rootMargin: "200px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  return (
    <div className="flex-1">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
        {products.slice(0, visible).map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} favorited={favSet.has(p.id)} />
        ))}
      </div>
      {visible < products.length && (
        <div ref={sentinel} className="h-20 grid place-items-center text-content-muted text-sm mt-6">
          Daha çox yüklənir...
        </div>
      )}
    </div>
  );
}
