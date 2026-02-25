import { NextResponse } from "next/server";
import { readAuthenticatedUserId } from "@/app/api/test/session/auth";
import { isProSubscriptionStatus } from "@/lib/billing/pro";
import { syncUserSubscriptionFromStripe } from "@/lib/billing/sync";
import { getStripeClient } from "@/lib/billing/stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST() {
  const userId = await readAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      stripeCustomerId: true,
      subscription: {
        select: {
          stripeSubscriptionId: true,
          status: true,
          cancelAtPeriodEnd: true,
        },
      },
    },
  });
  if (!user || !user.stripeCustomerId || !user.subscription) {
    return NextResponse.json({ error: "No Pro subscription found." }, { status: 404 });
  }

  if (!isProSubscriptionStatus(user.subscription.status)) {
    return NextResponse.json(
      { error: "Pro subscription is not active." },
      { status: 409 },
    );
  }
  if (user.subscription.cancelAtPeriodEnd) {
    return NextResponse.json(
      { error: "This Pro plan is already set to end at period end." },
      { status: 409 },
    );
  }

  try {
    const stripe = getStripeClient();
    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
    await syncUserSubscriptionFromStripe({
      userId,
      stripeCustomerId: user.stripeCustomerId,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to cancel Pro subscription." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
