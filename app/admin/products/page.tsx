import { redirect } from "next/navigation";
import Link from "next/link";
import { Package } from "lucide-react";
import { DashSidebar } from "@/components/layout/dash-sidebar";
import { Badge } from "@/components/ui/badge";
import { ADMIN_NAV } from "@/components/admin/admin-nav";
import { AdminSearch } from "@/components/admin/admin-search";
import { StatusFilter } from "@/components/admin/status-filter";
import { ApproveButtons, FeaturedToggle, AdminDeleteButton } from "@/components/admin/product-actions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

export const metadata = { title: "Məhsullar" };

const statusBadge: Record<string, { t: string; v: "success" | "warning" | "violet" | "accent" }> = {
  ACTIVE: { t: "Aktiv", v: "success" }, PENDING: { t: "Gözləyir", v: "warning" },
  DRAFT: { t: "Qaralama", v: "accent" }, SOLD: { t: "Satılıb", v: "violet" }, ARCHIVED: { t: "Arxiv", v: "warning" },
};

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");
  const { q, status } = await searchParams;

  const where: Prisma.ProductWhereInput = {
    ...(status && { status: status as Prisma.ProductWhereInput["status"] }),
    ...(q && { title: { contains: q, mode: "insensitive" } }),
  };

  let products: Array<{ id: string; slug: string; title: string; price: number; status: string; featured: boolean; seller: { shopName: string } }> = [];
  try {
    products = await prisma.product.findMany({ where, orderBy: { createdAt: "desc" }, take: 100, include: { seller: { select: { shopName: true } } } });
  } catch { /* DB yoxdursa boş */ }

  return (
    <div className="relative z-10 flex">
      <DashSidebar items={ADMIN_NAV} brand="Admin" />
      <main className="flex-1 p-6 md:p-8">
        <h1 className="font-display text-2xl font-bold mb-6 flex items-center gap-2"><Package size={22} className="text-accent" /> Məhsullar</h1>
        <div className="flex flex-col sm:flex-row gap-3 mb-5 sm:items-center justify-between">
          <AdminSearch placeholder="Məhsul axtar..." />
          <StatusFilter options={[
            { value: "PENDING", label: "Gözləyir" }, { value: "ACTIVE", label: "Aktiv" },
            { value: "ARCHIVED", label: "Arxiv" }, { value: "DRAFT", label: "Qaralama" },
          ]} />
        </div>

        <div className="rounded-[var(--radius)] bg-surface border border-[var(--border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-content-muted text-left border-b border-[var(--border)]">
                  <th className="p-4 font-medium">Məhsul</th><th className="p-4 font-medium">Satıcı</th>
                  <th className="p-4 font-medium">Qiymət</th><th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Seçilmiş</th><th className="p-4 font-medium">Əməliyyat</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={6} className="p-6 text-center text-content-muted">Məhsul tapılmadı</td></tr>
                ) : products.map((p) => {
                  const b = statusBadge[p.status] ?? statusBadge.ACTIVE;
                  return (
                    <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-surface">
                      <td className="p-4 font-medium"><Link href={`/marketplace/${p.slug}`} className="hover:text-accent">{p.title}</Link></td>
                      <td className="p-4 text-content-dim">{p.seller.shopName}</td>
                      <td className="p-4 font-display font-semibold">{formatPrice(p.price)}</td>
                      <td className="p-4"><Badge variant={b.v}>{b.t}</Badge></td>
                      <td className="p-4"><FeaturedToggle productId={p.id} featured={p.featured} /></td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <ApproveButtons productId={p.id} status={p.status} />
                          <AdminDeleteButton productId={p.id} />
                        </div>
                      </td>
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
