"use client";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { subscribeToPlan, buyCredits, promoteProduct } from "@/lib/actions/billing-actions";
import type { PlanTier } from "@/lib/payments/plans";

function go(url?: string, error?: string) {
  if (error) { alert(error); return; }
  if (url) window.location.href = url;
}

export function SubscribeButton({ tier, label, highlighted }: { tier: PlanTier; label: string; highlighted?: boolean }) {
  const [pending, start] = useTransition();
  return (
    <Button variant={highlighted ? "primary" : "ghost"} className="w-full" disabled={pending || tier === "FREE"}
      onClick={() => start(async () => { const r = await subscribeToPlan(tier); go(r.url, r.error); })}>
      {pending ? <Loader2 size={16} className="animate-spin" /> : label}
    </Button>
  );
}

export function BuyCreditsButton({ packId, label }: { packId: string; label: string }) {
  const [pending, start] = useTransition();
  return (
    <Button variant="ghost" size="sm" disabled={pending}
      onClick={() => start(async () => { const r = await buyCredits(packId); go(r.url, r.error); })}>
      {pending ? <Loader2 size={15} className="animate-spin" /> : label}
    </Button>
  );
}

export function PromoteButton({ productId, promo, label }: { productId: string; promo: "VIP_LISTING" | "SPONSORED" | "FEATURED"; label: string }) {
  const [pending, start] = useTransition();
  return (
    <Button variant="ghost" size="sm" disabled={pending}
      onClick={() => start(async () => { const r = await promoteProduct(productId, promo); go(r.url, r.error); })}>
      {pending ? <Loader2 size={15} className="animate-spin" /> : label}
    </Button>
  );
}
