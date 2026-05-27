import { LayoutDashboard, Users, Package, Store, Sparkles, MessageCircle } from "lucide-react";
import { DashSidebar } from "@/components/layout/dash-sidebar";
import { ADMIN_NAV } from "@/components/admin/admin-nav";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Chat Logları" };

const langLabel: Record<string, string> = { az: "🇦🇿 AZ", ru: "🇷🇺 RU", en: "🇬🇧 EN" };

export default async function ChatLogsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  let sessions: Array<{ id: string; language: string; totalTokens: number; createdAt: Date; _count: { messages: number } }> = [];
  let stats = { sessions: 0, messages: 0, tokens: 0 };
  try {
    sessions = await prisma.chatSession.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: { _count: { select: { messages: true } } },
    });
    const agg = await prisma.chatSession.aggregate({ _count: true, _sum: { totalTokens: true } });
    const msgCount = await prisma.chatMessage.count();
    stats = { sessions: agg._count, messages: msgCount, tokens: agg._sum.totalTokens ?? 0 };
  } catch { /* DB yoxdursa boş */ }

  return (
    <div className="relative z-10 flex">
      <DashSidebar items={ADMIN_NAV} brand="Admin" />
      <main className="flex-1 p-6 md:p-8">
        <h1 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
          <MessageCircle size={22} className="text-accent" /> Chat Köməkçi Logları
        </h1>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-[var(--radius)] bg-surface border border-[var(--border)]">
            <div className="text-content-dim text-sm">Söhbətlər</div>
            <div className="font-display text-3xl font-bold mt-2">{stats.sessions}</div>
          </div>
          <div className="p-5 rounded-[var(--radius)] bg-surface border border-[var(--border)]">
            <div className="text-content-dim text-sm">Mesajlar</div>
            <div className="font-display text-3xl font-bold mt-2">{stats.messages}</div>
          </div>
          <div className="p-5 rounded-[var(--radius)] bg-surface border border-[var(--border)]">
            <div className="text-content-dim text-sm">İstifadə olunan token</div>
            <div className="font-display text-3xl font-bold mt-2 text-accent">{stats.tokens.toLocaleString()}</div>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="p-10 rounded-[var(--radius)] bg-surface border border-dashed border-[var(--border)] text-center text-content-dim">
            Hələ söhbət logu yoxdur.
          </div>
        ) : (
          <div className="rounded-[var(--radius)] bg-surface border border-[var(--border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-content-muted text-left border-b border-[var(--border)]">
                  <th className="p-4 font-medium">Session</th>
                  <th className="p-4 font-medium">Dil</th>
                  <th className="p-4 font-medium">Mesaj</th>
                  <th className="p-4 font-medium">Token</th>
                  <th className="p-4 font-medium">Tarix</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-b border-[var(--border)] last:border-0 hover:bg-surface">
                    <td className="p-4 font-mono text-xs text-content-dim">{s.id.slice(0, 10)}…</td>
                    <td className="p-4">{langLabel[s.language] ?? s.language}</td>
                    <td className="p-4">{s._count.messages}</td>
                    <td className="p-4 font-display font-semibold">{s.totalTokens.toLocaleString()}</td>
                    <td className="p-4 text-content-muted text-xs">{s.createdAt.toLocaleDateString("az-AZ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
