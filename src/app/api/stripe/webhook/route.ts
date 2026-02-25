import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { readStripeWebhookSecret } from "@/lib/billing/config";
import { getStripeClient } from "@/lib/billing/stripe";
import { upsertUserSubscriptionFromStripe } from "@/lib/billing/subscription";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function readStripeCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
): string | null {
  if (!customer) {
    return null;
  }

  if (typeof customer === "string") {
    return customer;
  }

  return customer.id;
}

async function readRequiredUserIdByStripeCustomer(
  stripeCustomerId: string,
): Promise<string> {
  const user = await prisma.user.findUnique({
    where: {
      stripeCustomerId,
    },
    select: {
      id: true,
    },
  });
  if (!user) {
    throw new Error(`No user found for Stripe customer "${stripeCustomerId}".`);
  }

  return user.id;
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const stripeCustomerId = readStripeCustomerId(session.customer);
  const stripeSubscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;
  if (!stripeCustomerId || !stripeSubscriptionId) {
    return;
  }

  const userId = await readRequiredUserIdByStripeCustomer(stripeCustomerId);

  const stripe = getStripeClient();
  const subscription =
    await stripe.subscriptions.retrieve(stripeSubscriptionId);
  await upsertUserSubscriptionFromStripe(userId, subscription);
}

async function handleSubscriptionChanged(
  subscription: Stripe.Subscription,
): Promise<void> {
  const stripeCustomerId = readStripeCustomerId(subscription.customer);
  if (!stripeCustomerId) {
    return;
  }

  const userId = await readRequiredUserIdByStripeCustomer(stripeCustomerId);

  await upsertUserSubscriptionFromStripe(userId, subscription);
}

export async function POST(request: Request) {
  const stripeSignature = request.headers.get("stripe-signature");
  if (!stripeSignature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(
      payload,
      stripeSignature,
      readStripeWebhookSecret(),
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid Stripe webhook signature." },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionChanged(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to process Stripe webhook event." },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
