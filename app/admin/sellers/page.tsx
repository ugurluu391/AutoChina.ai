import { redirect } from "next/navigation";
import Link from "next/link";
import { Store } from "lucide-react";
import { DashSidebar } from "@/components/layout/dash-sidebar";
import { Badge } from "@/components/ui/badge";
import { ADMIN_NAV } from "@/components/admin/admin-nav";
import { AdminSearch } from "@/components/admin/admin-search";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VerifyToggle } from "@/components/admin/seller-actions";

export const metadata = { title: "Satıcılar" };

export default async function AdminSellersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");
  const { q } = await searchParams;

  let sellers: Array<{ id: string; shopName: string; city: string | null; verified: boolean; rating: number; _count: { products: number } }> = [];
  try {
    sellers = await prisma.seller.findMany({
      where: q ? { shopName: { contains: q, mode: "insensitive" } } : {},
      orderBy: { createdAt: "desc" }, take: 100,
      include: { _count: { select: { products: true } } },
    });
  } catch { /* DB yoxdursa boş */ }

  return (
    <div className="relative z-10 flex">
      <DashSidebar items={ADMIN_NAV} brand="Admin" />
      <main className="flex-1 p-6 md:p-8">
        <h1 className="font-display text-2xl font-bold mb-6 flex items-center gap-2"><Store size={22} className="text-accent" /> Satıcılar</h1>
        <div className="mb-5"><AdminSearch placeholder="Mağaza adı ilə axtar..." /></div>

        <div className="rounded-[var(--radius)] bg-surface border border-[var(--border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-content-muted text-left border-b border-[var(--border)]">
                  <th className="p-4 font-medium">Mağaza</th><th className="p-4 font-medium">Şəhər</th>
                  <th className="p-4 font-medium">Məhsul</th><th className="p-4 font-medium">Reytinq</th>
                  <th className="p-4 font-medium">Status</th><th className="p-4 font-medium">Əməliyyat</th>
                </tr>
              </thead>
              <tbody>
                {sellers.length === 0 ? (
                  <tr><td colSpan={6} className="p-6 text-center text-content-muted">Satıcı tapılmadı</td></tr>
                ) : sellers.map((s) => (
                  <tr key={s.id} className="border-b border-[var(--border)] last:border-0 hover:bg-surface">
                    <td className="p-4 font-medium"><Link href={`/seller/${s.id}`} className="hover:text-accent">{s.shopName}</Link></td>
                    <td className="p-4 text-content-dim">{s.city ?? "—"}</td>
                    <td className="p-4">{s._count.products}</td>
                    <td className="p-4">{s.rating.toFixed(1)} ★</td>
                    <td className="p-4">{s.verified ? <Badge variant="success">Təsdiqli</Badge> : <Badge variant="warning">Gözləyir</Badge>}</td>
                    <td className="p-4"><VerifyToggle sellerId={s.id} verified={s.verified} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
