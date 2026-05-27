"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/** Admin icazəsini yoxlayır — hər admin əməliyyatından əvvəl çağırılır */
async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("İcazə yoxdur");
  }
  return session.user.id;
}

/** İstifadəçini ban et / banı qaldır */
export async function toggleBanUser(userId: string) {
  await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { banned: true, role: true } });
  if (!user) return { error: "İstifadəçi tapılmadı" };
  if (user.role === "ADMIN") return { error: "Admini ban etmək olmaz" };

  await prisma.user.update({ where: { id: userId }, data: { banned: !user.banned } });
  revalidatePath("/admin/users");
  return { banned: !user.banned };
}

/** İstifadəçi rolunu dəyiş */
export async function changeUserRole(userId: string, role: "USER" | "SELLER" | "ADMIN") {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
  return { success: true };
}

/** Məhsul elanını təsdiqlə (PENDING → ACTIVE) */
export async function approveProduct(productId: string) {
  await requireAdmin();
  await prisma.product.update({ where: { id: productId }, data: { status: "ACTIVE" } });
  revalidatePath("/admin/products");
  revalidatePath("/marketplace");
  return { success: true };
}

/** Məhsul elanını rədd et (→ ARCHIVED) */
export async function rejectProduct(productId: string) {
  await requireAdmin();
  await prisma.product.update({ where: { id: productId }, data: { status: "ARCHIVED" } });
  revalidatePath("/admin/products");
  return { success: true };
}

/** Featured (seçilmiş) statusunu dəyiş */
export async function toggleFeatured(productId: string) {
  await requireAdmin();
  const p = await prisma.product.findUnique({ where: { id: productId }, select: { featured: true } });
  if (!p) return { error: "Tapılmadı" };
  await prisma.product.update({ where: { id: productId }, data: { featured: !p.featured } });
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { featured: !p.featured };
}

/** Məhsulu tamamilə sil (admin) */
export async function adminDeleteProduct(productId: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id: productId } });
  revalidatePath("/admin/products");
  revalidatePath("/marketplace");
  return { success: true };
}

/** Satıcını təsdiqlə (verified) */
export async function toggleSellerVerified(sellerId: string) {
  await requireAdmin();
  const s = await prisma.seller.findUnique({ where: { id: sellerId }, select: { verified: true } });
  if (!s) return { error: "Tapılmadı" };
  await prisma.seller.update({ where: { id: sellerId }, data: { verified: !s.verified } });
  revalidatePath("/admin/sellers");
  return { verified: !s.verified };
}
