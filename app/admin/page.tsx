import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SearchBar } from "@/components/marketplace/search-bar";
import { Filters } from "@/components/marketplace/filters";
import { ProductGrid } from "@/components/marketplace/product-grid";
import { getProducts } from "@/lib/queries/products";
import { getFavoriteIds } from "@/lib/actions/favorite-actions";
import { MOCK_PRODUCTS } from "@/data/mock";
import { ALLOW_MOCK_FALLBACK } from "@/lib/data-mode";
import type { ProductCardData } from "@/types";

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  if (sp.q) {
    return {
      title: `"${sp.q}" axtarışı`,
      description: `${sp.q} üçün Çin avtomobil ehtiyat hissələri. AutoChina AI marketplace.`,
    };
  }
  if (sp.brand) {
    return {
      title: `${sp.brand} ehtiyat hissələri`,
      description: `${sp.brand} avtomobilləri üçün orijinal və analoq ehtiyat hissələri.`,
    };
  }
  return {
    title: "Marketplace",
    description: "Çin avtomobilləri üçün bütün ehtiyat hissələri. Chery, BYD, Geely, Haval və daha çox.",
  };
}

type SP = { q?: string; brand?: string; category?: string; sort?: string; condition?: string };

export default async function MarketplacePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;

  let products: ProductCardData[] = [];
  let total = 0;
  let favoriteIds: string[] = [];
  let usingDb = false;

  try {
    const res = await getProducts({
      q: sp.q,
      brand: sp.brand,
      category: sp.category,
      condition: sp.condition ? sp.condition.split(",") : undefined,
      sort: (sp.sort as never) || "relevant",
      perPage: 48,
    });
    products = res.products;
    total = res.total;
    favoriteIds = await getFavoriteIds();
    usingDb = true;
  } catch {
    // DB əlçatmazdırsa: dev-də mock, production-da boş (real vəziyyət)
    if (ALLOW_MOCK_FALLBACK) {
      products = MOCK_PRODUCTS;
      total = MOCK_PRODUCTS.length;
    }
  }

  // DB işləyirsə real nəticə (boş ola bilər); yalnız dev fallback-də mock
  const display = usingDb ? products : (ALLOW_MOCK_FALLBACK ? MOCK_PRODUCTS : []);

  return (
    <>
      <Navbar />
      <main className="relative z-10 max-w-[1180px] mx-auto px-5 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-5">Marketplace</h1>
          <SearchBar defaultValue={sp.q ?? ""} />
        </div>
        <div className="flex gap-8">
          <Filters />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <span className="text-content-dim text-sm">{display.length} nəticə{sp.q ? ` · "${sp.q}"` : ""}</span>
              <select className="bg-surface border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none">
                <option>Ən uyğun</option>
                <option>Qiymət: aşağıdan</option>
                <option>Qiymət: yuxarıdan</option>
                <option>Reytinq</option>
              </select>
            </div>
            {display.length === 0 ? (
              <div className="p-12 rounded-[var(--radius)] bg-surface border border-dashed border-[var(--border)] text-center text-content-dim">
                Nəticə tapılmadı. Başqa açar söz və ya filter sınayın.
              </div>
            ) : (
              <ProductGrid products={display} favoriteIds={favoriteIds} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
