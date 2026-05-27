import { z } from "zod";

/** Login form validasiyası */
export const loginSchema = z.object({
  email: z.string().email("Düzgün e-poçt daxil edin"),
  password: z.string().min(6, "Şifrə ən azı 6 simvol olmalıdır"),
});

/** Qeydiyyat form validasiyası */
export const registerSchema = z
  .object({
    name: z.string().min(2, "Ad ən azı 2 simvol olmalıdır").max(60),
    email: z.string().email("Düzgün e-poçt daxil edin"),
    password: z
      .string()
      .min(6, "Şifrə ən azı 6 simvol olmalıdır")
      .max(72, "Şifrə çox uzundur")
      .regex(/[a-zA-Z]/, "Şifrədə hərf olmalıdır")
      .regex(/[0-9]/, "Şifrədə rəqəm olmalıdır"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Şifrələr uyğun gəlmir",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// ===================== MƏHSUL =====================

export const productSchema = z.object({
  title: z.string().min(3, "Başlıq ən azı 3 simvol olmalıdır").max(120),
  description: z.string().min(10, "Təsvir ən azı 10 simvol olmalıdır").max(3000),
  price: z.coerce.number().positive("Qiymət müsbət olmalıdır"),
  oldPrice: z.coerce.number().positive().optional().or(z.literal("").transform(() => undefined)),
  partNumber: z.string().max(60).optional(),
  condition: z.enum(["ORIGINAL", "AFTERMARKET", "USED"]),
  stockCount: z.coerce.number().int().min(0).default(1),
  carModel: z.string().max(80).optional(),
  categoryId: z.string().min(1, "Kateqoriya seçin"),
  brandId: z.string().min(1, "Marka seçin"),
  status: z.enum(["ACTIVE", "DRAFT", "PENDING", "SOLD", "ARCHIVED"]).default("ACTIVE"),
});

export type ProductInput = z.infer<typeof productSchema>;

// Satıcı profili
export const sellerSchema = z.object({
  shopName: z.string().min(2, "Mağaza adı ən azı 2 simvol").max(80),
  description: z.string().max(1000).optional(),
  city: z.string().max(60).optional(),
  phone: z.string().max(20).optional(),
  whatsapp: z.string().regex(/^\d{9,15}$/, "Düzgün nömrə daxil edin (məs: 994501234567)").optional().or(z.literal("")),
});

export type SellerInput = z.infer<typeof sellerSchema>;
