"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sellerSchema } from "@/lib/validations";

export type SellerActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/ə/g, "e").replace(/ı/g, "i").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Satıcı profili yarat və ya yenilə + istifadəçini SELLER roluna keçir */
export async function upsertSeller(_prev: SellerActionState, formData: FormData): Promise<SellerActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Daxil olun" };

  const parsed = sellerSchema.safeParse({
    shopName: formData.get("shopName"),
    description: formData.get("description"),
    city: formData.get("city"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp"),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const d = parsed.data;
  const userId = session.user.id;
  const existing = await prisma.seller.findUnique({ where: { userId } });

  if (existing) {
    await prisma.seller.update({
      where: { userId },
      data: { shopName: d.shopName, description: d.description, city: d.city, phone: d.phone, whatsapp: d.whatsapp || null },
    });
  } else {
    await prisma.seller.create({
      data: {
        userId,
        shopName: d.shopName,
        slug: slugify(d.shopName) + "-" + Math.random().toString(36).slice(2, 6),
        description: d.description,
        city: d.city,
        phone: d.phone,
        whatsapp: d.whatsapp || null,
      },
    });
    await prisma.user.update({ where: { id: userId }, data: { role: "SELLER" } });
  }

  revalidatePath("/seller/dashboard");
  return { success: true };
}
