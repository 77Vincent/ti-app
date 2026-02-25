import { prisma } from "@/lib/prisma";

type AccountUserRow = {
  name: string | null;
  email: string | null;
  stripeCustomerId: string | null;
  subscription: {
    status: string;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: Date | null;
  } | null;
};

const ACCOUNT_USER_SELECT = {
  name: true,
  email: true,
  stripeCustomerId: true,
  subscription: {
    select: {
      status: true,
      cancelAtPeriodEnd: true,
      currentPeriodEnd: true,
    },
  },
} as const;

export async function readAccountUserById(
  userId: string,
): Promise<AccountUserRow | null> {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: ACCOUNT_USER_SELECT,
  });
}
