/**
 * Mock fallback siyasəti.
 * - Development + DB əlçatmaz → mock göstər (rahat dev təcrübəsi)
 * - Production → HEÇ VAXT mock göstərmə (real DB, real boş nəticə)
 *
 * Bu, "demo data production-a sızmasın" tələbini təmin edir.
 */
export const ALLOW_MOCK_FALLBACK = process.env.NODE_ENV !== "production";
