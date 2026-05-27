import { getProducts } from "@/lib/queries/products";
import type { ProductCardData } from "@/types";
import type { VinAiResult } from "./ai-decode";

/**
 * Uyğunluq uyğunlaşdırması (compatibility matching).
 * VIN nəticəsindən markaya + modelə görə uyğun məhsulları tapır,
 * uyğunluq dərəcəsinə görə sıralayır.
 */

export type CompatibilityMatch = ProductCardData & {
  matchScore: number; // 0-100 uyğunluq faizi
  matchReason: string;
};

export async function findCompatibleProducts(vin: VinAiResult): Promise<CompatibilityMatch[]> {
  if (!vin.brandSlug) return [];

  try {
    // Markaya görə bütün uyğun məhsulları gətir
    const { products } = await getProducts({ brand: vin.brandSlug, perPage: 30 });

    const modelLower = vin.model?.toLowerCase() ?? "";
    const matches: CompatibilityMatch[] = products.map((p) => {
      let score = 50; // marka uyğunluğu baza
      let reason = `${vin.brand} markası ilə uyğun`;

      // Model uyğunluğu
      if (modelLower && p.carModel) {
        const pModel = p.carModel.toLowerCase();
        if (pModel === modelLower) { score = 100; reason = `${p.carModel} modeli ilə tam uyğun`; }
        else if (pModel.includes(modelLower.split(" ")[0]) || modelLower.includes(pModel.split(" ")[0])) {
          score = 80; reason = `${p.carModel} modeli ilə yüksək uyğunluq`;
        }
      }

      // Stokda olan + reytinqli məhsullara kiçik bonus
      if (p.inStock) score += 3;
      if (p.rating >= 4.7) score += 2;

      return { ...p, matchScore: Math.min(score, 100), matchReason: reason };
    });

    // Uyğunluğa görə sırala
    return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 12);
  } catch {
    return [];
  }
}
