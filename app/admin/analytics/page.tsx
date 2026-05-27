import { redirect } from "next/navigation";
import { BarChart3, TrendingUp, DollarSign, Sparkles } from "lucide-react";
import { DashSidebar } from "@/components/layout/dash-sidebar";
import { StatCard } from "@/components/ui/stat-card";
import { ADMIN_NAV } from "@/components/admin/admin-nav";
import { GrowthChart, CategoryBarChart, StatusPieChart } from "@/components/admin/charts";
import { auth } from "@/lib/auth";
import { getAdminOverview, getGrowthSeries, getCategoryDistribution, getProductStatusBreakdown } from "@/lib/queries/admin-stats";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Analitika" };

export default async function AnalyticsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  let overview = { users: 0, products: 0, revenue: 0, aiLogs: 0, totalTokens: 0 } as Awaited<ReturnType<typeof getAdminOverview>>;
  let growth: Awaited<ReturnType<typeof getGrowthSeries>> = [];
  let categories: Awaited<ReturnType<typeof getCategoryDistribution>> = [];
  let statuses: Awaited<ReturnType<typeof getProductStatusBreakdown>> = [];
  try {
    [overview, growth, categories, statuses] = await Promise.all([
      getAdminOverview(), getGrowthSeries(14), getCategoryDistribution(), getProductStatusBreakdown(),
    ]);
  } catch { /* DB yoxdursa boş qrafiklər */ }

  return (
    <div className="relative z-10 flex">
      <DashSidebar items={ADMIN_NAV} brand="Admin" />
      <main className="flex-1 p-6 md:p-8">
        <h1 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 size={22} className="text-accent" /> Analitika
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Gəlir (cəmi)" value={formatPrice(overview.revenue)} icon={DollarSign} />
          <StatCard label="İstifadəçilər" value={String(overview.users)} icon={TrendingUp} />
          <StatCard label="AI generasiya" value={String(overview.aiLogs)} icon={Sparkles} />
          <StatCard label="Chat token" value={overview.totalTokens.toLocaleString()} icon={Sparkles} />
        </div>

        {/* Artım qrafiki */}
        <div className="rounded-[var(--radius)] bg-surface border border-[var(--border)] p-5 mb-6">
          <h2 className="font-display font-bold mb-4">Son 14 gün — artım</h2>
          <GrowthChart data={growth} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-[var(--radius)] bg-surface border border-[var(--border)] p-5">
            <h2 className="font-display font-bold mb-4">Kateqoriya üzrə məhsullar</h2>
            {categories.length ? <CategoryBarChart data={categories} /> : <p className="text-content-muted text-sm py-10 text-center">Məlumat yoxdur</p>}
          </div>
          <div className="rounded-[var(--radius)] bg-surface border border-[var(--border)] p-5">
            <h2 className="font-display font-bold mb-4">Status üzrə paylanma</h2>
            {statuses.length ? <StatusPieChart data={statuses} /> : <p className="text-content-muted text-sm py-10 text-center">Məlumat yoxdur</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
