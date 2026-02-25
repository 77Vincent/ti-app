type RequiredBillingEnvName =
  | "STRIPE_SECRET_KEY"
  | "STRIPE_WEBHOOK_SECRET"
  | "STRIPE_PRO_PRICE_ID";

function readRequiredBillingEnv(name: RequiredBillingEnvName): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`${name} is required for billing.`);
  }

  return value.trim();
}

export function readStripeSecretKey(): string {
  return readRequiredBillingEnv("STRIPE_SECRET_KEY");
}

export function readStripeWebhookSecret(): string {
  return readRequiredBillingEnv("STRIPE_WEBHOOK_SECRET");
}

export function readStripeProPriceId(): string {
  return readRequiredBillingEnv("STRIPE_PRO_PRICE_ID");
}

export function readAppUrl(): string {
  const value = process.env.NEXT_PUBLIC_APP_URL;
  if (!value || value.trim().length === 0) {
    throw new Error("NEXT_PUBLIC_APP_URL is required for billing.");
  }

  return value.trim().replace(/\/+$/, "");
}
