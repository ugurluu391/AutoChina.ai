/**
 * Environment dəyişənlərinin validasiyası.
 * Tələb olunan dəyişənlər yoxdursa, dərhal aydın xəta verir
 * (gizli runtime xətalarının qarşısını alır).
 */

type EnvCheck = { key: string; required: boolean; group: string };

const ENV_VARS: EnvCheck[] = [
  { key: "DATABASE_URL", required: true, group: "Verilənlər bazası" },
  { key: "AUTH_SECRET", required: true, group: "Autentifikasiya" },
  { key: "NEXT_PUBLIC_SITE_URL", required: false, group: "SEO" },
  { key: "AUTH_GOOGLE_ID", required: false, group: "Google login" },
  { key: "AUTH_GOOGLE_SECRET", required: false, group: "Google login" },
  { key: "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", required: false, group: "Cloudinary" },
  { key: "CLOUDINARY_API_KEY", required: false, group: "Cloudinary" },
  { key: "CLOUDINARY_API_SECRET", required: false, group: "Cloudinary" },
  { key: "ANTHROPIC_API_KEY", required: false, group: "AI funksiyaları" },
  { key: "STRIPE_SECRET_KEY", required: false, group: "Ödəniş" },
  { key: "STRIPE_WEBHOOK_SECRET", required: false, group: "Ödəniş" },
];

/** Tələb olunan env-ləri yoxlayır. Production build zamanı çağırılır. */
export function validateEnv(): { ok: boolean; missing: string[]; warnings: string[] } {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const v of ENV_VARS) {
    if (!process.env[v.key]) {
      if (v.required) missing.push(`${v.key} (${v.group})`);
      else warnings.push(`${v.key} (${v.group}) — bu funksiya əlçatmaz olacaq`);
    }
  }

  return { ok: missing.length === 0, missing, warnings };
}

/** Funksiyanın aktiv olub-olmadığını yoxlayır */
export const features = {
  google: () => !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET,
  cloudinary: () => !!process.env.CLOUDINARY_API_KEY && !!process.env.CLOUDINARY_API_SECRET,
  ai: () => !!process.env.ANTHROPIC_API_KEY,
  payments: () => !!process.env.STRIPE_SECRET_KEY,
};
