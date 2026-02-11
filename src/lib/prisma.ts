import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  __tiAppPrisma?: PrismaClient;
};

export const prisma = globalForPrisma.__tiAppPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__tiAppPrisma = prisma;
}
