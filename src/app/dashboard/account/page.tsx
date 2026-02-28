import { readAuthenticatedUserId } from "@/app/api/test/session/auth";
import { LabeledValue } from "@/app/components";
import { isProSubscriptionStatus } from "@/lib/billing/pro";
import { syncUserSubscriptionFromStripe } from "@/lib/billing/sync";
import CancelProButton from "./CancelProButton";
import LogoutButton from "./LogoutButton";
import { readAccountUserById } from "./repo";
import UpgradeToProButton from "./UpgradeToProButton";

type AccountProfile = {
  name: string;
  email: string;
  plan: string;
};

export default async function DashboardAccountPage() {
  const userId = await readAuthenticatedUserId();
  let user = userId ? await readAccountUserById(userId) : null;
  let didSyncFail = false;
  const isLocalPro =
    user?.subscription &&
    isProSubscriptionStatus(user.subscription.status);

  if (userId && user?.stripeCustomerId && !isLocalPro) {
    try {
      await syncUserSubscriptionFromStripe({
        userId,
        stripeCustomerId: user.stripeCustomerId,
      });
      user = await readAccountUserById(userId);
    } catch (error) {
      didSyncFail = true;
      console.error("Failed to sync Pro plan status from Stripe.", error);
    }
  }

  const isPro =
    user?.subscription &&
    isProSubscriptionStatus(user.subscription.status);
  const isCancellationScheduled = user?.subscription?.cancelAtPeriodEnd ?? false;
  const currentPeriodEnd = user?.subscription?.currentPeriodEnd ?? null;
  const periodLabelDate = currentPeriodEnd
    ? currentPeriodEnd.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const profile: AccountProfile = {
    name: user?.name?.trim() || "Unknown",
    email: user?.email?.trim() || "Unknown",
    plan: !isPro
      ? "Free"
      : periodLabelDate
        ? isCancellationScheduled
          ? `Pro (Ends on ${periodLabelDate})`
          : `Pro (Renews on ${periodLabelDate})`
        : "Pro",
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <LabeledValue label="Name" value={profile.name} />
      <LabeledValue label="Email" value={profile.email} />
      <LabeledValue label="Plan" value={profile.plan} />
      {didSyncFail ? (
        <p className="text-sm text-warning">
          Plan sync is temporarily unavailable. Please refresh later.
        </p>
      ) : null}
      {isPro ? (
        <CancelProButton isCancellationScheduled={isCancellationScheduled} />
      ) : null}
      {!isPro ? <UpgradeToProButton /> : null}
      <LogoutButton />
    </div>
  );
}
