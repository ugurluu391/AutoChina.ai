import Stripe from "stripe";

/**
 * Stripe client (server-only).
 * ⚠️ STRIPE_SECRET_KEY olmadan null qaytarır — sistem çökmür,
 * sadəcə ödəniş funksiyaları əlçatmaz olur.
 */
let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY təyin edilməyib");
    stripe = new Stripe(key, { apiVersion: "2024-12-18.acacia" });
  }
  return stripe;
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}
