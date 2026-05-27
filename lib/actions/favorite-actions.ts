"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/** Favoriti aç/bağla (toggle) — login tələb olunur */
export async function toggleFavorite(productId: string): Promise<{ favorited: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { favorited: false, error: "Daxil olun" };

  const userId = session.user.id;
  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
    revalidatePath("/dashboard");
    return { favorited: false };
  }

  await prisma.wishlist.create({ data: { userId, productId } });
  revalidatePath("/dashboard");
  return { favorited: true };
}

/** İstifadəçinin favorit etdiyi məhsul ID-ləri (kart vəziyyəti üçün) */
export async function getFavoriteIds(): Promise<string[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  const rows = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  });
  return rows.map((r) => r.productId);
}
