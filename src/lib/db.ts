import { PrismaClient } from "@prisma/client";

/**
 * Lazy, optional Prisma client.
 *
 * The public site does NOT need a database (feed + rivers are cached in
 * memory). A database is only used for admin features (curated posts,
 * moderation). On serverless hosts (e.g. Vercel free tier) there is usually no
 * writable DB, so `getPrisma()` returns null and callers degrade gracefully
 * instead of crashing. When `DATABASE_URL` points at a real DB (local SQLite,
 * or a hosted Postgres/libSQL), everything works fully.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient | null;
};

export function getPrisma(): PrismaClient | null {
  if (globalForPrisma.prisma !== undefined) return globalForPrisma.prisma;

  if (!process.env.DATABASE_URL) {
    globalForPrisma.prisma = null;
    return null;
  }

  try {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
    globalForPrisma.prisma = client;
    return client;
  } catch {
    globalForPrisma.prisma = null;
    return null;
  }
}

/** True when admin/persistence features are available. */
export function hasDatabase(): boolean {
  return getPrisma() !== null;
}
