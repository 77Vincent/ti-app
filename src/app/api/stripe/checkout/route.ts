import { NextResponse } from "next/server";
import { readAuthenticatedUserId } from "@/app/api/test/session/auth";
import {
  readAppUrl,
  readStripeProPriceId,
} from "@/lib/billing/config";
import { isUserPro } from "@/lib/billing/pro";
import { getStripeClient } from "@/lib/billing/stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const CHECKOUT_SUCCESS_QUERY = "billing=success";
const CHECKOUT_CANCEL_QUERY = "billing=cancel";

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
      id: true,
      email: true,
      stripeCustomerId: true,
    },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }
  if (await isUserPro(user.id)) {
    return NextResponse.json(
      { error: "Pro subscription is already active." },
      { status: 409 },
    );
  }

  try {
    const stripe = getStripeClient();
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          stripeCustomerId: customerId,
        },
      });
    }

    const appUrl = readAppUrl();
    const proPriceId = readStripeProPriceId();

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price: proPriceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard/account?${CHECKOUT_SUCCESS_QUERY}`,
      cancel_url: `${appUrl}/dashboard/account?${CHECKOUT_CANCEL_QUERY}`,
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "Checkout URL is unavailable." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch {
    return NextResponse.json(
      { error: "Failed to create Stripe checkout session." },
      { status: 500 },
    );
  }
}
