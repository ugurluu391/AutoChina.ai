/**
 * Sadə in-memory rate limiter.
 * ⚠️ Production-da çoxlu instans üçün Upstash Redis / @upstash/ratelimit istifadə edin.
 * Bu versiya tək instans / development üçün uyğundur.
 */
type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

// Köhnə entry-ləri təmizlə (memory leak qarşısı)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of store) if (now > v.resetAt) store.delete(k);
  }, 5 * 60_000).unref?.();
}
