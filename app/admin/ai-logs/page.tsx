import { LayoutDashboard, Users, Package, Store, Sparkles } from "lucide-react";
import { DashSidebar } from "@/components/layout/dash-sidebar";
import { ADMIN_NAV } from "@/components/admin/admin-nav";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "AI Logları" };

export default async function AiLogsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  let logs: Awaited<ReturnType<typeof prisma.aiGenerationLog.findMany>> = [];
  let stats = { total: 0, success: 0, avgMs: 0 };
  try {
    logs = await prisma.aiGenerationLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    const all = await prisma.aiGenerationLog.aggregate({ _count: true, _avg: { durationMs: true } });
    const ok = await prisma.aiGenerationLog.count({ where: { success: true } });
    stats = { total: all._count, success: ok, avgMs: Math.round(all._avg.durationMs ?? 0) };
  } catch { /* DB yoxdursa boş */ }

  return (
    <div className="relative z-10 flex">
      <DashSidebar items={ADMIN_NAV} brand="Admin" />
      <main className="flex-1 p-6 md:p-8">
        <h1 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
          <Sparkles size={22} className="text-accent" /> AI Generasiya Logları
        </h1>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-[var(--radius)] bg-surface border border-[var(--border)]">
            <div className="text-content-dim text-sm">Ümumi generasiya</div>
            <div className="font-display text-3xl font-bold mt-2">{stats.total}</div>
          </div>
          <div className="p-5 rounded-[var(--radius)] bg-surface border border-[var(--border)]">
            <div className="text-content-dim text-sm">Uğurlu</div>
            <div className="font-display text-3xl font-bold mt-2 text-[var(--success)]">{stats.success}</div>
          </div>
          <div className="p-5 rounded-[var(--radius)] bg-surface border border-[var(--border)]">
            <div className="text-content-dim text-sm">Orta müddət</div>
            <div className="font-display text-3xl font-bold mt-2">{stats.avgMs}ms</div>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="p-10 rounded-[var(--radius)] bg-surface border border-dashed border-[var(--border)] text-center text-content-dim">
            Hələ AI generasiya logu yoxdur.
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="p-4 rounded-[var(--radius-sm)] bg-surface border border-[var(--border)]">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="font-semibold text-sm">{log.productName}</div>
                  <div className="flex items-center gap-2">
                    {log.success ? <Badge variant="success">Uğurlu</Badge> : <Badge variant="warning">Xəta</Badge>}
                    <span className="text-content-muted text-xs">{log.durationMs}ms</span>
                  </div>
                </div>
                <div className="text-content-dim text-xs flex flex-wrap gap-2">
                  {log.brand && <span>{log.brand}</span>}
                  {log.carModel && <span>· {log.carModel}</span>}
                  {log.year && <span>· {log.year}</span>}
                  <span>· {log.createdAt.toLocaleDateString("az-AZ")}</span>
                </div>
                {log.title && <div className="text-sm mt-2 text-content-dim line-clamp-1">→ {log.title}</div>}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
