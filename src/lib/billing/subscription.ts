import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";

function toDateFromUnixTimestamp(seconds: number): Date {
  return new Date(seconds * 1000);
}

function readRequiredStripePriceId(subscription: Stripe.Subscription): string {
  const stripePriceId = subscription.items.data[0]?.price?.id;
  if (!stripePriceId) {
    throw new Error("Stripe subscription price id is missing.");
  }

  return stripePriceId;
}

export async function upsertUserSubscriptionFromStripe(
  userId: string,
  subscription: Stripe.Subscription,
): Promise<void> {
  const stripePriceId = readRequiredStripePriceId(subscription);
  const subscriptionPeriodEnd =
    subscription.items.data[0]?.current_period_end ?? null;
  const commonData = {
    stripeSubscriptionId: subscription.id,
    stripePriceId,
    status: subscription.status,
    currentPeriodEnd:
      subscriptionPeriodEnd === null
        ? null
        : toDateFromUnixTimestamp(subscriptionPeriodEnd),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  } as const;

  await prisma.subscription.upsert({
    where: {
      userId,
    },
    create: {
      userId,
      ...commonData,
    },
    update: commonData,
  });
}
