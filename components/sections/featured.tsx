import { SectionHead } from "./section-head";
import { ProductCard } from "@/components/marketplace/product-card";
import { MOCK_PRODUCTS } from "@/data/mock";
import { ALLOW_MOCK_FALLBACK } from "@/lib/data-mode";
import { getProducts } from "@/lib/queries/products";
import type { ProductCardData } from "@/types";

export async function Featured() {
  let products: ProductCardData[] = [];
  try {
    // Featured/populyar məhsulları gətir
    const res = await getProducts({ sort: "relevant", perPage: 8 });
    products = res.products;
  } catch {
    // DB əlçatmaz
  }

  // Production-da real (boşdursa bölmə gizlənir); dev-də mock
  if (products.length === 0) {
    if (!ALLOW_MOCK_FALLBACK) return null; // production: real featured yoxdursa bölməni göstərmə
    products = MOCK_PRODUCTS.slice(0, 8);
  }

  return (
    <section className="relative z-10 max-w-[1180px] mx-auto px-5 py-14">
      <SectionHead eyebrow="Seçilmiş hissələr" title="Populyar ehtiyat hissələri" />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-5">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}
