"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getProvider } from "@/lib/payments";
import { PLANS, CREDIT_PACKS, PROMO_PRICES, type PlanTier } from "@/lib/payments/plans";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function requireSeller() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const seller = await prisma.seller.findUnique({ where: { userId: session.user.id } });
  if (!seller) redirect("/seller/setup");
  return { userId: session.user.id, seller, email: session.user.email ?? undefined };
}

/** Abunə planına keçid (Stripe checkout) */
export async function subscribeToPlan(tier: PlanTier): Promise<{ error?: string; url?: string }> {
  const { seller, email } = await requireSeller();
  const plan = PLANS[tier];
  if (tier === "FREE") return { error: "Pulsuz plan üçün ödəniş tələb olunmur" };
  if (!plan.stripePriceId) return { error: "Bu plan hazırda əlçatan deyil (Stripe Price ID konfiqurasiya edilməyib)" };

  try {
    const { url } = await getProvider("STRIPE").createCheckout({
      amount: plan.price,
      purpose: "SUBSCRIPTION",
      description: `${plan.name} abunəsi`,
      recurringPriceId: plan.stripePriceId,
      successUrl: `${SITE_URL}/seller/billing?success=1`,
      cancelUrl: `${SITE_URL}/seller/billing?canceled=1`,
      customerEmail: email,
      metadata: { sellerId: seller.id, tier },
    });
    return { url };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

/** AI kredit paketi al */
export async function buyCredits(packId: string): Promise<{ error?: string; url?: string }> {
  const { seller, email } = await requireSeller();
  const pack = CREDIT_PACKS.find((p) => p.id === packId);
  if (!pack) return { error: "Paket tapılmadı" };

  try {
    const { url } = await getProvider("STRIPE").createCheckout({
      amount: pack.price,
      purpose: "AI_CREDITS",
      description: `${pack.credits} AI krediti`,
      successUrl: `${SITE_URL}/seller/billing?success=1`,
      cancelUrl: `${SITE_URL}/seller/billing?canceled=1`,
      customerEmail: email,
      metadata: { sellerId: seller.id, credits: String(pack.credits) },
    });
    return { url };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

/** Məhsulu VIP/Sponsorlu/Featured et */
export async function promoteProduct(
  productId: string,
  promo: "VIP_LISTING" | "SPONSORED" | "FEATURED"
): Promise<{ error?: string; url?: string }> {
  const { seller, email } = await requireSeller();
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.sellerId !== seller.id) return { error: "Məhsul tapılmadı" };

  const cfg = PROMO_PRICES[promo];
  try {
    const { url } = await getProvider("STRIPE").createCheckout({
      amount: cfg.price,
      purpose: promo,
      description: `${product.title} — ${promo} (${cfg.days} gün)`,
      successUrl: `${SITE_URL}/seller/dashboard?promoted=1`,
      cancelUrl: `${SITE_URL}/seller/dashboard?canceled=1`,
      customerEmail: email,
      metadata: { sellerId: seller.id, productId, promo, days: String(cfg.days) },
    });
    return { url };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
