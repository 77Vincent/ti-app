import { prisma } from "@/lib/prisma";

const PRO_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

export function isProSubscriptionStatus(status: string): boolean {
  return PRO_SUBSCRIPTION_STATUSES.has(status);
}

export async function isUserPro(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: {
      userId,
    },
    select: {
      status: true,
    },
  });

  if (!subscription) {
    return false;
  }

  return isProSubscriptionStatus(subscription.status);
}
