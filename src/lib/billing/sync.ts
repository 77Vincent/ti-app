import { prisma } from "@/lib/prisma";
import { getStripeClient } from "./stripe";
import { upsertUserSubscriptionFromStripe } from "./subscription";

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

  await upsertUserSubscriptionFromStripe(input.userId, latestSubscription);
}
