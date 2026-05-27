import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return new NextResponse("İcazə yoxdur", { status: 403 });

  const type = req.nextUrl.searchParams.get("type");
  let rows: Record<string, unknown>[] = [];

  try {
    if (type === "users") {
      const users = await prisma.user.findMany({ select: { name: true, email: true, role: true, banned: true, createdAt: true } });
      rows = users.map((u) => ({ Ad: u.name, Email: u.email, Rol: u.role, Banlı: u.banned ? "Bəli" : "Xeyr", Tarix: u.createdAt.toISOString().slice(0, 10) }));
    } else if (type === "products") {
      const products = await prisma.product.findMany({ select: { title: true, price: true, status: true, views: true, createdAt: true } });
      rows = products.map((p) => ({ Başlıq: p.title, Qiymət: p.price, Status: p.status, Baxış: p.views, Tarix: p.createdAt.toISOString().slice(0, 10) }));
    } else if (type === "sales") {
      const orders = await prisma.order.findMany({ select: { id: true, total: true, status: true, createdAt: true } });
      rows = orders.map((o) => ({ Sifariş: o.id, Məbləğ: o.total, Status: o.status, Tarix: o.createdAt.toISOString().slice(0, 10) }));
    } else {
      return new NextResponse("Naməlum hesabat növü", { status: 400 });
    }
  } catch {
    return new NextResponse("Hesabat yaradıla bilmədi (DB?)", { status: 500 });
  }

  const csv = "\uFEFF" + toCsv(rows); // BOM — Excel UTF-8 üçün
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="autochina-${type}-${Date.now()}.csv"`,
    },
  });
}
