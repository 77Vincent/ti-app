import { prisma } from "@/lib/prisma";

export async function findUserIdBySessionToken(
  sessionToken: string,
  now: Date = new Date(),
): Promise<string | null> {
  const session = await prisma.session.findUnique({
    where: {
      sessionToken,
    },
    select: {
      expires: true,
      userId: true,
    },
  });

  if (!session || session.expires <= now) {
    return null;
  }

  return session.userId;
}
