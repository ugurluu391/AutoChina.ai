/**
 * Provider-agnostic ödəniş interfeysi.
 * Stripe və lokal ödəniş sistemləri eyni interfeysi implement edir.
 * Yeni provider əlavə etmək üçün PaymentProvider implement et.
 */

export type CheckoutParams = {
  amount: number; // AZN
  currency?: string;
  purpose: "SUBSCRIPTION" | "AI_CREDITS" | "VIP_LISTING" | "SPONSORED" | "FEATURED";
  description: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
  // Abunə üçün
  recurringPriceId?: string;
};

export type CheckoutResult = {
  url: string; // istifadəçinin yönləndiriləcəyi ödəniş səhifəsi
  sessionId: string;
};

export interface PaymentProviderAdapter {
  name: "STRIPE" | "LOCAL";
  createCheckout(params: CheckoutParams): Promise<CheckoutResult>;
}
