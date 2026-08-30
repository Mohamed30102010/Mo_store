import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// PostgreSQL — Prisma 7 بيحتاج "Adapter" رسمي للاتصال وقت التشغيل (مش url في الـ schema)
function makeClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// Singleton عشان ما نفتحش اتصالات كتير في وضع التطوير (hot reload) وفي serverless
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof makeClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
