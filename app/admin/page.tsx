import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Package, Store, DollarSign, Clock, Ban, Sparkles, ArrowRight } from "lucide-react";
import { DashSidebar } from "@/components/layout/dash-sidebar";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { ADMIN_NAV } from "@/components/admin/admin-nav";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAdminOverview } from "@/lib/queries/admin-stats";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  let s = { users: 0, products: 0, sellers: 0, orders: 0, pendingProducts: 0, bannedUsers: 0, aiLogs: 0, chatSessions: 0, revenue: 0, totalTokens: 0 };
  let recent: Array<{ id: string; title: string; status: string; price: number; seller: { shopName: string } }> = [];
  try {
    s = await getAdminOverview();
    recent = await prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { seller: { select: { shopName: true } } } });
  } catch { /* DB yoxdursa boş göstər */ }

  const statusBadge: Record<string, { t: string; v: "success" | "warning" | "violet" | "accent" }> = {
    ACTIVE: { t: "Aktiv", v: "success" }, PENDING: { t: "Gözləyir", v: "warning" },
    DRAFT: { t: "Qaralama", v: "accent" }, SOLD: { t: "Satılıb", v: "violet" }, ARCHIVED: { t: "Arxiv", v: "warning" },
  };

  return (
    <div className="relative z-10 flex">
      <DashSidebar items={ADMIN_NAV} brand="Admin" />
      <main className="flex-1 p-6 md:p-8">
        <h1 className="font-display text-2xl font-bold mb-6">Admin İcmalı</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="İstifadəçilər" value={String(s.users)} sub={`${s.bannedUsers} banlı`} icon={Users} />
          <StatCard label="Məhsullar" value={String(s.products)} sub={`${s.pendingProducts} gözləyir`} icon={Package} />
          <StatCard label="Satıcılar" value={String(s.sellers)} icon={Store} />
          <StatCard label="Gəlir" value={formatPrice(s.revenue)} icon={DollarSign} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Sifarişlər" value={String(s.orders)} icon={DollarSign} />
          <StatCard label="Təsdiq gözləyir" value={String(s.pendingProducts)} icon={Clock} />
          <StatCard label="AI generasiya" value={String(s.aiLogs)} icon={Sparkles} />
          <StatCard label="Chat token" value={s.totalTokens.toLocaleString()} icon={Sparkles} />
        </div>

        {/* Sürətli keçidlər */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {[
            { href: "/admin/products?status=PENDING", label: "Təsdiq gözləyən elanlar", count: s.pendingProducts, icon: Clock },
            { href: "/admin/users", label: "İstifadəçi idarəetməsi", count: s.users, icon: Users },
            { href: "/admin/analytics", label: "Analitika", count: null, icon: Sparkles },
          ].map((q) => (
            <Link key={q.href} href={q.href} className="group flex items-center justify-between p-4 rounded-[var(--radius)] bg-surface border border-[var(--border)] hover:border-[var(--border-glow)] transition-all">
              <div className="flex items-center gap-3">
                <q.icon size={18} className="text-accent" />
                <span className="text-sm font-medium">{q.label}</span>
                {q.count !== null && q.count > 0 && <Badge variant="warning">{q.count}</Badge>}
              </div>
              <ArrowRight size={16} className="text-content-muted group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}
        </div>

        <div className="rounded-[var(--radius)] bg-surface border border-[var(--border)] overflow-hidden">
          <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="font-display font-bold">Son məhsullar</h2>
            <Link href="/admin/products" className="text-sm text-accent hover:underline">Hamısı →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-content-muted text-left border-b border-[var(--border)]">
                  <th className="p-4 font-medium">Məhsul</th><th className="p-4 font-medium">Satıcı</th>
                  <th className="p-4 font-medium">Qiymət</th><th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-content-muted">Məlumat yoxdur (DB qurulmayıb)</td></tr>
                ) : recent.map((r) => {
                  const b = statusBadge[r.status] ?? statusBadge.ACTIVE;
                  return (
                    <tr key={r.id} className="border-b border-[var(--border)] last:border-0 hover:bg-surface">
                      <td className="p-4 font-medium">{r.title}</td>
                      <td className="p-4 text-content-dim">{r.seller.shopName}</td>
                      <td className="p-4 font-display font-semibold">{formatPrice(r.price)}</td>
                      <td className="p-4"><Badge variant={b.v}>{b.t}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
