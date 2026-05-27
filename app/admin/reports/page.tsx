import { redirect } from "next/navigation";
import { FileText, Download, Users, Package, DollarSign } from "lucide-react";
import { DashSidebar } from "@/components/layout/dash-sidebar";
import { ADMIN_NAV } from "@/components/admin/admin-nav";
import { auth } from "@/lib/auth";
import { getAdminOverview } from "@/lib/queries/admin-stats";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Hesabatlar" };

const reports = [
  { type: "users", label: "İstifadəçi hesabatı", desc: "Bütün istifadəçilər, rollar, statuslar", icon: Users },
  { type: "products", label: "Məhsul hesabatı", desc: "Bütün məhsullar, qiymət, status, baxış", icon: Package },
  { type: "sales", label: "Satış hesabatı", desc: "Sifarişlər və gəlir", icon: DollarSign },
];

export default async function ReportsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  let s = { users: 0, products: 0, revenue: 0, orders: 0 } as Awaited<ReturnType<typeof getAdminOverview>>;
  try { s = await getAdminOverview(); } catch { /* boş */ }

  return (
    <div className="relative z-10 flex">
      <DashSidebar items={ADMIN_NAV} brand="Admin" />
      <main className="flex-1 p-6 md:p-8">
        <h1 className="font-display text-2xl font-bold mb-6 flex items-center gap-2"><FileText size={22} className="text-accent" /> Hesabatlar</h1>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-[var(--radius)] bg-surface border border-[var(--border)]">
            <div className="text-content-dim text-sm">İstifadəçilər</div>
            <div className="font-display text-2xl font-bold mt-1">{s.users}</div>
          </div>
          <div className="p-5 rounded-[var(--radius)] bg-surface border border-[var(--border)]">
            <div className="text-content-dim text-sm">Məhsullar</div>
            <div className="font-display text-2xl font-bold mt-1">{s.products}</div>
          </div>
          <div className="p-5 rounded-[var(--radius)] bg-surface border border-[var(--border)]">
            <div className="text-content-dim text-sm">Gəlir</div>
            <div className="font-display text-2xl font-bold mt-1">{formatPrice(s.revenue)}</div>
          </div>
        </div>

        <h2 className="font-display font-bold mb-4">CSV Hesabatları yüklə</h2>
        <div className="space-y-3">
          {reports.map((r) => (
            <a key={r.type} href={`/api/admin/report?type=${r.type}`}
              className="group flex items-center justify-between p-4 rounded-[var(--radius)] bg-surface border border-[var(--border)] hover:border-[var(--border-glow)] transition-all">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-[10px] bg-surface-2 grid place-items-center"><r.icon size={18} className="text-accent" /></span>
                <div>
                  <div className="font-semibold text-sm">{r.label}</div>
                  <div className="text-content-muted text-xs">{r.desc}</div>
                </div>
              </div>
              <Download size={18} className="text-content-muted group-hover:text-accent transition-colors" />
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
