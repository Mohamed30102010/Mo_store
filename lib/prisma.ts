import { PrismaClient } from "@/app/generated/prisma/client";

// PostgreSQL — بيستخدم DATABASE_URL من الـ schema مباشرة (متغير بيئة سيرفر فقط)
function makeClient() {
  return new PrismaClient({
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
