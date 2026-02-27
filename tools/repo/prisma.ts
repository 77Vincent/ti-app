import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function disconnectRepoPrisma(): Promise<void> {
  await prisma.$disconnect();
}
