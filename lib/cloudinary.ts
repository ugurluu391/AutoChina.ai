import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary konfiqurasiyası (server-only).
 * ⚠️ Bu fayl yalnız server-də (server actions / API routes) istifadə olunur.
 */
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export type UploadedImage = {
  url: string;
  publicId: string;
  width: number;
  height: number;
};

/**
 * Base64 və ya data URI şəklini Cloudinary-yə yükləyir.
 * Avtomatik optimizasiya + sıxışdırma tətbiq olunur:
 *  - format: auto (WebP/AVIF brauzerə görə)
 *  - quality: auto:good (vizual itki olmadan ən kiçik ölçü)
 *  - max ölçü: 1600px (böyük şəkilləri kiçildir)
 */
export async function uploadProductImage(
  dataUri: string,
  folder = "autochina/products"
): Promise<UploadedImage> {
  const res = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    transformation: [
      { width: 1600, height: 1600, crop: "limit" },
      { quality: "auto:good", fetch_format: "auto" },
    ],
    // Yüklənən fayl ölçüsünü də sıxışdırır
    eager: [{ width: 600, height: 600, crop: "fill", quality: "auto:eco" }],
  });

  return {
    url: res.secure_url,
    publicId: res.public_id,
    width: res.width,
    height: res.height,
  };
}

/** Cloudinary-dən şəkli silir (məhsul redaktə/silmə zamanı) */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // Silmə uğursuz olsa belə əməliyyatı bloklamırıq
  }
}

/**
 * Cloudinary URL-ə optimizasiya transformasiyaları əlavə edir.
 * Mövcud URL-i thumbnail / responsive ölçüyə çevirir.
 */
export function optimizedUrl(url: string, width = 600): string {
  if (!url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/w_${width},q_auto:good,f_auto/`);
}
