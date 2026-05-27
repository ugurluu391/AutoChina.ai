/**
 * Strukturlu logging sistemi.
 * Production-da JSON (log aqreqatorları üçün), dev-də oxunaqlı.
 * Monitoring servisi (Sentry, Axiom, Datadog) inteqrasiyası üçün hazır nöqtə.
 */

type Level = "debug" | "info" | "warn" | "error";
const isProd = process.env.NODE_ENV === "production";

function log(level: Level, message: string, meta?: Record<string, unknown>) {
  const entry = { level, message, timestamp: new Date().toISOString(), ...meta };

  if (isProd) {
    // Production: strukturlu JSON (Vercel/Axiom/Datadog avtomatik toplayır)
    const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    fn(JSON.stringify(entry));
    // TODO: kritik xətaları monitoring servisinə göndər
    // if (level === "error") sendToSentry(message, meta);
  } else {
    // Dev: oxunaqlı
    const emoji = { debug: "🔍", info: "ℹ️", warn: "⚠️", error: "❌" }[level];
    const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    fn(`${emoji} [${level}] ${message}`, meta ?? "");
  }
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => !isProd && log("debug", msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => log("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log("error", msg, meta),
};
