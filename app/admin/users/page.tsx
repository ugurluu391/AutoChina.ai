import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { DashSidebar } from "@/components/layout/dash-sidebar";
import { Badge } from "@/components/ui/badge";
import { ADMIN_NAV } from "@/components/admin/admin-nav";
import { AdminSearch } from "@/components/admin/admin-search";
import { BanButton, RoleSelect } from "@/components/admin/user-actions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "İstifadəçilər" };

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");
  const { q } = await searchParams;

  let users: Array<{ id: string; name: string | null; email: string; role: string; banned: boolean; createdAt: Date }> = [];
  try {
    users = await prisma.user.findMany({
      where: q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {},
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch { /* DB yoxdursa boş */ }

  return (
    <div className="relative z-10 flex">
      <DashSidebar items={ADMIN_NAV} brand="Admin" />
      <main className="flex-1 p-6 md:p-8">
        <h1 className="font-display text-2xl font-bold mb-6 flex items-center gap-2"><Users size={22} className="text-accent" /> İstifadəçilər</h1>
        <div className="mb-5"><AdminSearch placeholder="Ad və ya email ilə axtar..." /></div>

        <div className="rounded-[var(--radius)] bg-surface border border-[var(--border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-content-muted text-left border-b border-[var(--border)]">
                  <th className="p-4 font-medium">İstifadəçi</th><th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Rol</th><th className="p-4 font-medium">Status</th><th className="p-4 font-medium">Əməliyyat</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-content-muted">İstifadəçi tapılmadı</td></tr>
                ) : users.map((u) => (
                  <tr key={u.id} className="border-b border-[var(--border)] last:border-0 hover:bg-surface">
                    <td className="p-4 font-medium">{u.name ?? "—"}</td>
                    <td className="p-4 text-content-dim">{u.email}</td>
                    <td className="p-4"><RoleSelect userId={u.id} role={u.role} /></td>
                    <td className="p-4">{u.banned ? <Badge variant="warning">Banlı</Badge> : <Badge variant="success">Aktiv</Badge>}</td>
                    <td className="p-4"><BanButton userId={u.id} banned={u.banned} isAdmin={u.role === "ADMIN"} /></td>
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
