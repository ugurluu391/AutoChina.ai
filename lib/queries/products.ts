import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { ProductCardData } from "@/types";

export type ProductFilters = {
  q?: string;
  brand?: string;
  category?: string;
  condition?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: "relevant" | "price_asc" | "price_desc" | "rating" | "newest";
  page?: number;
  perPage?: number;
};

/** Cloudinary URL və ya emoji fallback-i kart formatına çevirir */
function toCard(p: {
  id: string; title: string; slug: string; price: number; oldPrice: number | null;
  images: string[]; condition: string; rating: number; inStock: boolean;
  carModel: string | null; brand: { name: string }; isVip?: boolean;
}): ProductCardData {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: p.price,
    oldPrice: p.oldPrice,
    image: p.images[0] ?? "🚗",
    brandName: p.brand.name,
    carModel: p.carModel,
    condition: p.condition as ProductCardData["condition"],
    rating: p.rating,
    inStock: p.inStock,
    isVip: p.isVip ?? false,
  };
}

/** Filtrlərlə məhsul axtarışı (fuzzy + sıralama + səhifələmə) */
export async function getProducts(filters: ProductFilters = {}) {
  const { q, brand, category, condition, minPrice, maxPrice, sort = "relevant", page = 1, perPage = 12 } = filters;

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    ...(brand && { brand: { slug: brand } }),
    ...(category && { category: { slug: category } }),
    ...(condition?.length && { condition: { in: condition as ("ORIGINAL" | "AFTERMARKET" | "USED")[] } }),
    ...((minPrice != null || maxPrice != null) && {
      price: { ...(minPrice != null && { gte: minPrice }), ...(maxPrice != null && { lte: maxPrice }) },
    }),
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { partNumber: { contains: q, mode: "insensitive" } },
        { carModel: { contains: q, mode: "insensitive" } },
        { brand: { name: { contains: q, mode: "insensitive" } } },
      ],
    }),
  };

  // VIP və sponsorlu məhsullar həmişə yuxarıda (monetizasiya)
  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    sort === "price_asc" ? [{ isVip: "desc" }, { price: "asc" }]
    : sort === "price_desc" ? [{ isVip: "desc" }, { price: "desc" }]
    : sort === "rating" ? [{ isVip: "desc" }, { rating: "desc" }]
    : sort === "newest" ? [{ isVip: "desc" }, { createdAt: "desc" }]
    : [{ isVip: "desc" }, { isSponsored: "desc" }, { views: "desc" }];

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where, orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      include: { brand: { select: { name: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  return { products: items.map(toCard), total, page, perPage, pages: Math.ceil(total / perPage) };
}

/** Tək məhsul (slug ilə) — baxış sayğacı +1 */
export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: true,
      productImages: { orderBy: { position: "asc" } },
      seller: { select: { id: true, shopName: true, slug: true, logo: true, city: true, phone: true, whatsapp: true, verified: true, rating: true } },
      reviews: { include: { user: { select: { name: true, image: true } } }, orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!product) return null;

  // Baxış sayğacını artır (fire-and-forget)
  prisma.product.update({ where: { id: product.id }, data: { views: { increment: 1 } } }).catch(() => {});
  return product;
}

/** Əlaqəli məhsullar (eyni kateqoriya/marka) */
export async function getRelatedProducts(productId: string, categoryId: string, brandId: string) {
  const items = await prisma.product.findMany({
    where: { status: "ACTIVE", id: { not: productId }, OR: [{ categoryId }, { brandId }] },
    take: 4,
    include: { brand: { select: { name: true } } },
    orderBy: { views: "desc" },
  });
  return items.map(toCard);
}

/** Autocomplete təklifləri (sürətli, yüngül) */
export async function getSuggestions(q: string) {
  if (!q || q.length < 2) return [];
  const items = await prisma.product.findMany({
    where: { status: "ACTIVE", title: { contains: q, mode: "insensitive" } },
    select: { title: true, slug: true },
    take: 6,
  });
  return items;
}
