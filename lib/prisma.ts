import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client singleton — development-də hot-reload zamanı
 * çoxlu connection açılmasının qarşısını alır.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
