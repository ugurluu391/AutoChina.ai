import { prisma } from "@/lib/prisma";

export async function getBrands() {
  return prisma.carBrand.findMany({ orderBy: { name: "asc" } });
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

/** Bir markanın modelləri — məhsullardan unikal carModel-lər */
export async function getModelsForBrand(brandSlug: string) {
  const rows = await prisma.product.findMany({
    where: { brand: { slug: brandSlug }, carModel: { not: null } },
    select: { carModel: true },
    distinct: ["carModel"],
  });
  return rows.map((r) => r.carModel).filter(Boolean) as string[];
}
