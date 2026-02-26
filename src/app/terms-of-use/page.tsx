import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | Ti",
};

export default function TermsOfUsePage() {
  return (
    <section className="mx-auto w-full max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold">Terms of Use</h1>
      <p className="text-default-600">
        By using this application, you agree to use it lawfully and
        responsibly. Do not attempt to disrupt service, abuse system resources,
        or access data you are not authorized to access.
      </p>
      <p className="text-default-600">
        The service is provided as-is and may change over time. We may suspend
        access when needed to protect system integrity or comply with legal
        requirements.
      </p>
      <p className="text-default-600">
        Some features are available only through the Pro subscription plan.
        Pricing, billing cycle, and included features are shown at checkout and
        may be updated in the future.
      </p>
      <p className="text-default-600">
        Pro access remains active through the paid billing period. If canceled,
        renewal stops at the end of the current billing cycle unless otherwise
        stated.
      </p>
    </section>
  );
}
