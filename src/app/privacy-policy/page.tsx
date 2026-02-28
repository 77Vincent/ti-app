import type { Metadata } from "next";
import { LegalPageLayout } from "@/app/components";
import { withBrandTitle } from "@/lib/config/brand";
import { PAGE_PATHS } from "@/lib/config/paths";
import { readSiteUrl } from "@/lib/config/siteUrl";

const PRIVACY_POLICY_URL = `${readSiteUrl()}${PAGE_PATHS.PRIVACY_POLICY}`;

export const metadata: Metadata = {
  title: withBrandTitle("Privacy Policy"),
  alternates: {
    canonical: PRIVACY_POLICY_URL,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout>
      <h1 className="text-2xl font-semibold">Privacy Policy</h1>
      <p className="text-default-600">
        We store only the data required to provide the testing experience, such
        as account identity, preferences, and test progress.
      </p>
      <p className="text-default-600">
        We do not sell personal data. Access to data is restricted to authorized
        operations required to run the product.
      </p>
      <p className="text-default-600">
        For Pro subscriptions, we process billing-related metadata such as plan
        status, transaction identifiers, and renewal/cancelation events to
        manage access and support requests.
      </p>
      <p className="text-default-600">
        Payment details are handled by the payment provider used at checkout.
        We only retain the minimum billing information needed for records,
        account access, and fraud prevention.
      </p>
      <p className="text-default-600">
        If you have a privacy request, contact the product operator and include
        enough account detail for verification.
      </p>
    </LegalPageLayout>
  );
}
