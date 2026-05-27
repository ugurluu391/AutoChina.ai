import { redirect } from "next/navigation";
import { DollarSign, TrendingUp, Users, CreditCard } from "lucide-react";
import { DashSidebar } from "@/components/layout/dash-sidebar";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { ADMIN_NAV } from "@/components/admin/admin-nav";
import { CategoryBarChart } from "@/components/admin/charts";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Gəlir" };

export default async function RevenuePage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  let totalRevenue = 0, mrr = 0, activeSubsCount = 0, payments: Array<{ id: string; amount: number; purpose: string; status: string; provider: string; createdAt: Date; seller: { shopName: string } | null }> = [];
  let byPurpose: { name: string; value: number }[] = [];
  let tierDist: { name: string; value: number }[] = [];

  try {
    const revAgg = await prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "SUCCEEDED" } });
    totalRevenue = revAgg._sum.amount ?? 0;

    const activeSubs = await prisma.subscription.findMany({ where: { status: "ACTIVE", tier: { not: "FREE" } } });
    activeSubsCount = activeSubs.length;

    const subRev = await prisma.payment.groupBy({ by: ["purpose"], _sum: { amount: true }, where: { status: "SUCCEEDED" } });
    const purposeLabel: Record<string, string> = { SUBSCRIPTION: "Abunə", AI_CREDITS: "AI kredit", VIP_LISTING: "VIP", SPONSORED: "Sponsor", FEATURED: "Featured" };
    byPurpose = subRev.map((g) => ({ name: purposeLabel[g.purpose] ?? g.purpose, value: Math.round(g._sum.amount ?? 0) }));

    const tiers = await prisma.subscription.groupBy({ by: ["tier"], _count: true });
    tierDist = tiers.map((t) => ({ name: t.tier, value: t._count }));

    // MRR təxmini (aktiv abunələrin aylıq dəyəri — sadələşdirilmiş)
    const { PLANS } = await import("@/lib/payments/plans");
    mrr = activeSubs.reduce((s, sub) => s + (PLANS[sub.tier as keyof typeof PLANS]?.price ?? 0), 0);

    payments = await prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 20, include: { seller: { select: { shopName: true } } } });
  } catch { /* DB yoxdursa boş */ }

  return (
    <div className="relative z-10 flex">
      <DashSidebar items={ADMIN_NAV} brand="Admin" />
      <main className="flex-1 p-6 md:p-8">
        <h1 className="font-display text-2xl font-bold mb-6 flex items-center gap-2"><DollarSign size={22} className="text-accent" /> Gəlir & Monetizasiya</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Ümumi gəlir" value={formatPrice(totalRevenue)} icon={DollarSign} />
          <StatCard label="MRR (aylıq)" value={formatPrice(mrr)} sub="təxmini" icon={TrendingUp} />
          <StatCard label="Aktiv abunələr" value={String(activeSubsCount)} icon={Users} />
          <StatCard label="Ödənişlər" value={String(payments.length)} sub="son 20" icon={CreditCard} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="rounded-[var(--radius)] bg-surface border border-[var(--border)] p-5">
            <h2 className="font-display font-bold mb-4">Gəlir mənbəyi üzrə</h2>
            {byPurpose.length ? <CategoryBarChart data={byPurpose} /> : <p className="text-content-muted text-sm py-10 text-center">Məlumat yoxdur</p>}
          </div>
          <div className="rounded-[var(--radius)] bg-surface border border-[var(--border)] p-5">
            <h2 className="font-display font-bold mb-4">Plan paylanması</h2>
            {tierDist.length ? <CategoryBarChart data={tierDist} /> : <p className="text-content-muted text-sm py-10 text-center">Məlumat yoxdur</p>}
          </div>
        </div>

        <h2 className="font-display text-lg font-bold mb-5">Son ödənişlər</h2>
        <div className="rounded-[var(--radius)] bg-surface border border-[var(--border)] overflow-hidden">
          {payments.length === 0 ? (
            <div className="p-8 text-center text-content-muted text-sm">Hələ ödəniş yoxdur.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-content-muted text-left border-b border-[var(--border)]">
                  <th className="p-4 font-medium">Satıcı</th><th className="p-4 font-medium">Təyinat</th>
                  <th className="p-4 font-medium">Məbləğ</th><th className="p-4 font-medium">Provider</th>
                  <th className="p-4 font-medium">Status</th><th className="p-4 font-medium">Tarix</th>
                </tr></thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-surface">
                      <td className="p-4">{p.seller?.shopName ?? "—"}</td>
                      <td className="p-4 text-content-dim">{p.purpose}</td>
                      <td className="p-4 font-display font-semibold">{formatPrice(p.amount)}</td>
                      <td className="p-4 text-content-muted text-xs">{p.provider}</td>
                      <td className="p-4"><Badge variant={p.status === "SUCCEEDED" ? "success" : "warning"}>{p.status}</Badge></td>
                      <td className="p-4 text-content-muted text-xs">{p.createdAt.toLocaleDateString("az-AZ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
