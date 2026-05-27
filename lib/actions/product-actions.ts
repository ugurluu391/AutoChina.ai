"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { productSchema } from "@/lib/validations";
import { uploadProductImage, deleteImage } from "@/lib/cloudinary";
import { rateLimit } from "@/lib/rate-limit";

export type ProductActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

const slugify = (s: string) =>
  s.toLowerCase().trim()
    .replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ç/g, "c").replace(/ğ/g, "g")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Math.random().toString(36).slice(2, 7);

/** Cari istifadəçinin satıcı profilini gətirir (yoxdursa null) */
async function requireSeller() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const seller = await prisma.seller.findUnique({ where: { userId: session.user.id } });
  return { userId: session.user.id, seller };
}

/** MƏHSUL YARAT (şəkil yükləmə daxil) */
export async function createProduct(_prev: ProductActionState, formData: FormData): Promise<ProductActionState> {
  const { userId, seller } = await requireSeller();
  if (!seller) return { error: "Əvvəlcə satıcı profili yaradın" };

  const rl = rateLimit(`create-product:${userId}`, 20, 60_000);
  if (!rl.success) return { error: "Çox cəhd. Bir az gözləyin." };

  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    oldPrice: formData.get("oldPrice"),
    partNumber: formData.get("partNumber"),
    condition: formData.get("condition"),
    stockCount: formData.get("stockCount"),
    carModel: formData.get("carModel"),
    categoryId: formData.get("categoryId"),
    brandId: formData.get("brandId"),
    status: formData.get("status") || "ACTIVE",
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  // Şəkilləri yüklə (data URI massivi kimi gəlir)
  const imageData = formData.getAll("images") as string[];
  const uploaded = [];
  for (const uri of imageData.filter((u) => u?.startsWith("data:"))) {
    try {
      uploaded.push(await uploadProductImage(uri));
    } catch {
      return { error: "Şəkil yüklənərkən xəta baş verdi" };
    }
  }

  const d = parsed.data;
  await prisma.product.create({
    data: {
      title: d.title,
      slug: slugify(d.title),
      description: d.description,
      price: d.price,
      oldPrice: d.oldPrice ?? null,
      partNumber: d.partNumber || null,
      condition: d.condition,
      stockCount: d.stockCount,
      inStock: d.stockCount > 0,
      carModel: d.carModel || null,
      status: d.status,
      categoryId: d.categoryId,
      brandId: d.brandId,
      sellerId: seller.id,
      images: uploaded.map((u) => u.url),
      productImages: { create: uploaded.map((u, i) => ({ url: u.url, publicId: u.publicId, position: i, width: u.width, height: u.height })) },
    },
  });

  revalidatePath("/seller/dashboard");
  revalidatePath("/marketplace");
  redirect("/seller/dashboard");
}

/** MƏHSUL REDAKTƏ */
export async function updateProduct(productId: string, _prev: ProductActionState, formData: FormData): Promise<ProductActionState> {
  const { seller } = await requireSeller();
  if (!seller) return { error: "İcazə yoxdur" };

  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing || existing.sellerId !== seller.id) return { error: "Bu məhsul sizə aid deyil" };

  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    oldPrice: formData.get("oldPrice"),
    partNumber: formData.get("partNumber"),
    condition: formData.get("condition"),
    stockCount: formData.get("stockCount"),
    carModel: formData.get("carModel"),
    categoryId: formData.get("categoryId"),
    brandId: formData.get("brandId"),
    status: formData.get("status") || existing.status,
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  // Yeni şəkillər varsa əlavə et
  const imageData = (formData.getAll("images") as string[]).filter((u) => u?.startsWith("data:"));
  const uploaded = [];
  for (const uri of imageData) {
    try { uploaded.push(await uploadProductImage(uri)); } catch { /* davam et */ }
  }

  const d = parsed.data;
  await prisma.product.update({
    where: { id: productId },
    data: {
      title: d.title,
      description: d.description,
      price: d.price,
      oldPrice: d.oldPrice ?? null,
      partNumber: d.partNumber || null,
      condition: d.condition,
      stockCount: d.stockCount,
      inStock: d.stockCount > 0,
      carModel: d.carModel || null,
      status: d.status,
      categoryId: d.categoryId,
      brandId: d.brandId,
      ...(uploaded.length && {
        images: [...existing.images, ...uploaded.map((u) => u.url)],
        productImages: { create: uploaded.map((u, i) => ({ url: u.url, publicId: u.publicId, position: existing.images.length + i, width: u.width, height: u.height })) },
      }),
    },
  });

  revalidatePath("/seller/dashboard");
  revalidatePath(`/marketplace/${existing.slug}`);
  return { success: true };
}

/** MƏHSUL SİL (Cloudinary şəkilləri də silinir) */
export async function deleteProduct(productId: string) {
  const { seller } = await requireSeller();
  if (!seller) return;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { productImages: true },
  });
  if (!product || product.sellerId !== seller.id) return;

  // Cloudinary şəkillərini sil
  await Promise.all(product.productImages.map((img) => deleteImage(img.publicId)));
  await prisma.product.delete({ where: { id: productId } });

  revalidatePath("/seller/dashboard");
  revalidatePath("/marketplace");
}
