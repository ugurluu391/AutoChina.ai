import type { PaymentProviderAdapter, CheckoutParams, CheckoutResult } from "./provider";

/**
 * Lokal ödəniş sistemləri üçün adapter (məs: Azərbaycan bank ödəniş şlüzləri).
 * Hazırda placeholder — real inteqrasiya üçün provayderin API-si bura əlavə edilir
 * (məs: Kapital Bank, ABB, Azericard pay gateway).
 */
export const localAdapter: PaymentProviderAdapter = {
  name: "LOCAL",
  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    // TODO: Real lokal şlüz inteqrasiyası
    // Nümunə struktur — provayderin sənədlərinə görə doldurulur:
    // const res = await fetch(GATEWAY_URL, { method: "POST", body: ... });
    // return { url: res.paymentUrl, sessionId: res.orderId };

    throw new Error("Lokal ödəniş şlüzü hələ konfiqurasiya edilməyib. lib/payments/local-adapter.ts faylına baxın.");
  },
};
