import type { Metadata } from "next";
import { LegalPageLayout } from "@/app/components";
import { withBrandTitle } from "@/lib/config/brand";
import { PAGE_PATHS } from "@/lib/config/paths";
import { readSiteUrl } from "@/lib/config/siteUrl";

const TERMS_OF_USE_URL = `${readSiteUrl()}${PAGE_PATHS.TERMS_OF_USE}`;

export const metadata: Metadata = {
  title: withBrandTitle("Terms of Use"),
  alternates: {
    canonical: TERMS_OF_USE_URL,
  },
};

export default function TermsOfUsePage() {
  return (
    <LegalPageLayout>
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
    </LegalPageLayout>
  );
}
