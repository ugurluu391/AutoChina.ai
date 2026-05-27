import { getStripe } from "./stripe";
import type { PaymentProviderAdapter, CheckoutParams, CheckoutResult } from "./provider";

export const stripeAdapter: PaymentProviderAdapter = {
  name: "STRIPE",
  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    const stripe = getStripe();
    const isSubscription = params.purpose === "SUBSCRIPTION" && params.recurringPriceId;

    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? "subscription" : "payment",
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer_email: params.customerEmail,
      metadata: { purpose: params.purpose, ...params.metadata },
      line_items: isSubscription
        ? [{ price: params.recurringPriceId!, quantity: 1 }]
        : [{
            price_data: {
              currency: (params.currency ?? "azn").toLowerCase(),
              product_data: { name: params.description },
              unit_amount: Math.round(params.amount * 100), // qəpik
            },
            quantity: 1,
          }],
    });

    return { url: session.url!, sessionId: session.id };
  },
};
