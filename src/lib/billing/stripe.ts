import Stripe from "stripe";
import { readStripeSecretKey } from "./config";

const globalForStripe = globalThis as typeof globalThis & {
  __tiAppStripe?: Stripe;
};

export function getStripeClient(): Stripe {
  const stripe = globalForStripe.__tiAppStripe ?? new Stripe(readStripeSecretKey());

  if (process.env.NODE_ENV !== "production") {
    globalForStripe.__tiAppStripe = stripe;
  }

  return stripe;
}
