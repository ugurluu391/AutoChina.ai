import { stripeAdapter } from "./stripe-adapter";
import { localAdapter } from "./local-adapter";
import type { PaymentProviderAdapter } from "./provider";

export type ProviderName = "STRIPE" | "LOCAL";

/** Provider seçir — default Stripe */
export function getProvider(name: ProviderName = "STRIPE"): PaymentProviderAdapter {
  return name === "LOCAL" ? localAdapter : stripeAdapter;
}

export * from "./provider";
export * from "./plans";
