import { prisma } from "@/lib/prisma";

/** Ümumi dashboard statistikası */
export async function getAdminOverview() {
  const [users, products, sellers, orders, pendingProducts, bannedUsers, aiLogs, chatSessions] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.seller.count(),
    prisma.order.count(),
    prisma.product.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { banned: true } }),
    prisma.aiGenerationLog.count(),
    prisma.chatSession.count(),
  ]);

  const revenueAgg = await prisma.order.aggregate({ _sum: { total: true }, where: { status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] } } });
  const tokenAgg = await prisma.chatSession.aggregate({ _sum: { totalTokens: true } });

  return {
    users, products, sellers, orders, pendingProducts, bannedUsers, aiLogs, chatSessions,
    revenue: revenueAgg._sum.total ?? 0,
    totalTokens: tokenAgg._sum.totalTokens ?? 0,
  };
}

/** Son 7 günün gündəlik məhsul/istifadəçi artımı (qrafik üçün) */
export async function getGrowthSeries(days = 14) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [users, products, ai] = await Promise.all([
    prisma.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.product.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.aiGenerationLog.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
  ]);

  const buckets: Record<string, { date: string; users: number; products: number; ai: number }> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(5, 10); // MM-DD
    buckets[key] = { date: key, users: 0, products: 0, ai: 0 };
  }
  const add = (arr: { createdAt: Date }[], field: "users" | "products" | "ai") => {
    for (const r of arr) {
      const key = r.createdAt.toISOString().slice(5, 10);
      if (buckets[key]) buckets[key][field]++;
    }
  };
  add(users, "users"); add(products, "products"); add(ai, "ai");
  return Object.values(buckets);
}

/** Kateqoriya üzrə məhsul paylanması (qrafik üçün) */
export async function getCategoryDistribution() {
  const cats = await prisma.category.findMany({
    select: { name: true, _count: { select: { products: true } } },
  });
  return cats.map((c) => ({ name: c.name, value: c._count.products })).filter((c) => c.value > 0);
}

/** Status üzrə məhsul sayı */
export async function getProductStatusBreakdown() {
  const grouped = await prisma.product.groupBy({ by: ["status"], _count: true });
  const label: Record<string, string> = { ACTIVE: "Aktiv", DRAFT: "Qaralama", PENDING: "Gözləyir", SOLD: "Satılıb", ARCHIVED: "Arxiv" };
  return grouped.map((g) => ({ name: label[g.status] ?? g.status, value: g._count }));
}
