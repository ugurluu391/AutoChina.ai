/**
 * Monetizasiya konfiqurasiyası — bütün qiymətlər və planlar burada.
 * ⚠️ Mərkəzi yer: qiymət dəyişikliyi yalnız burada edilir.
 */

export type PlanTier = "FREE" | "PREMIUM" | "PRO";

export const PLANS: Record<PlanTier, {
  name: string;
  price: number; // AZN/ay
  stripePriceId?: string; // Stripe Price ID (.env-dən gəlir)
  aiCreditsPerMonth: number;
  maxProducts: number;
  features: string[];
  highlighted?: boolean;
}> = {
  FREE: {
    name: "Pulsuz",
    price: 0,
    aiCreditsPerMonth: 5,
    maxProducts: 10,
    features: ["10 məhsul", "5 AI krediti/ay", "Əsas statistika", "Topluluq dəstəyi"],
  },
  PREMIUM: {
    name: "Premium",
    price: 19,
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM,
    aiCreditsPerMonth: 50,
    maxProducts: 100,
    features: ["100 məhsul", "50 AI krediti/ay", "VIP elan endirimi", "Analitika", "Prioritet dəstək"],
    highlighted: true,
  },
  PRO: {
    name: "Pro",
    price: 49,
    stripePriceId: process.env.STRIPE_PRICE_PRO,
    aiCreditsPerMonth: 200,
    maxProducts: 1000,
    features: ["Limitsiz məhsul", "200 AI krediti/ay", "Pulsuz VIP elanlar", "Tam analitika", "API girişi", "Fərdi dəstək"],
  },
};

// AI kredit paketləri (birdəfəlik alış)
export const CREDIT_PACKS = [
  { id: "pack_20", credits: 20, price: 5 },
  { id: "pack_50", credits: 50, price: 10 },
  { id: "pack_150", credits: 150, price: 25 },
];

// Promosyon qiymətləri (məhsul başına, birdəfəlik)
export const PROMO_PRICES = {
  VIP_LISTING: { days: 7, price: 8 }, // 7 gün VIP
  SPONSORED: { days: 14, price: 15 }, // 14 gün sponsorlu
  FEATURED: { days: 30, price: 20 }, // 30 gün ana səhifədə seçilmiş
};

export function getPlan(tier: PlanTier) {
  return PLANS[tier];
}
