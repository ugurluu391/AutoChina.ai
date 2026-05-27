"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

async function clientKey(prefix: string) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return `${prefix}:${ip}`;
}

/** QEYDİYYAT */
export async function registerAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Rate limit: 5 cəhd / dəqiqə
  const rl = rateLimit(await clientKey("register"), 5, 60_000);
  if (!rl.success) return { error: "Çox cəhd. Bir az gözləyin." };

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Bu e-poçt artıq qeydiyyatdan keçib" };

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { name, email, password: hashed, role: "USER" },
  });

  // Avtomatik login
  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (e) {
    if (e instanceof AuthError) return { error: "Giriş zamanı xəta" };
    throw e; // redirect-i ötür
  }
  return { success: true };
}

/** LOGIN */
export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rl = rateLimit(await clientKey("login"), 5, 60_000);
  if (!rl.success) return { error: "Çox cəhd. Bir az gözləyin." };

  const raw = { email: formData.get("email"), password: formData.get("password") };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "E-poçt və ya şifrə yanlışdır" };
    }
    throw e; // redirect-i ötür
  }
  return { success: true };
}

/** GOOGLE LOGIN */
export async function googleLoginAction() {
  await signIn("google", { redirectTo: "/dashboard" });
}

/** LOGOUT */
export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
