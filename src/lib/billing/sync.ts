import { prisma } from "@/lib/prisma";
import { getStripeClient } from "./stripe";

function toDateFromUnixTimestamp(seconds: number): Date {
  return new Date(seconds * 1000);
}

type SyncUserSubscriptionInput = {
  userId: string;
  stripeCustomerId: string;
};

export async function syncUserSubscriptionFromStripe(
  input: SyncUserSubscriptionInput,
): Promise<void> {
  const stripe = getStripeClient();
  const subscriptions = await stripe.subscriptions.list({
    customer: input.stripeCustomerId,
    status: "all",
    limit: 1,
  });
  const latestSubscription = subscriptions.data[0];

  if (!latestSubscription) {
    await prisma.subscription.deleteMany({
      where: {
        userId: input.userId,
      },
    });
    return;
  }

  const firstItem = latestSubscription.items.data[0];
  if (!firstItem?.price?.id) {
    throw new Error("Stripe subscription price id is missing.");
  }

  await prisma.subscription.upsert({
    where: {
      userId: input.userId,
    },
    create: {
      userId: input.userId,
      stripeSubscriptionId: latestSubscription.id,
      stripePriceId: firstItem.price.id,
      status: latestSubscription.status,
      currentPeriodEnd: toDateFromUnixTimestamp(firstItem.current_period_end),
      cancelAtPeriodEnd: latestSubscription.cancel_at_period_end,
    },
    update: {
      stripeSubscriptionId: latestSubscription.id,
      stripePriceId: firstItem.price.id,
      status: latestSubscription.status,
      currentPeriodEnd: toDateFromUnixTimestamp(firstItem.current_period_end),
      cancelAtPeriodEnd: latestSubscription.cancel_at_period_end,
    },
  });
}
