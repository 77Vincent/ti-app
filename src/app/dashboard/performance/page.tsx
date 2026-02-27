import SubcategorySubmissionBars from "./SubcategorySubmissionBars";
import SubcategoryAccuracyBars from "./SubcategoryAccuracyBars";
import { readAuthenticatedUserId } from "@/app/api/test/session/auth";
import { StatsCards } from "@/app/components";
import { buildStatsCardItems } from "@/lib/stats/cards";
import { readStats } from "@/lib/stats/data";

export default async function DashboardPerformancePage() {
  const userId = await readAuthenticatedUserId();
  if (!userId) {
    throw new Error("Expected authenticated user in stats");
  }

  const { stats, subcategorySubmissionStats, subcategoryAccuracyStats } =
    await readStats({ userId });
  const statItems = buildStatsCardItems(stats);

  return (
    <section className="space-y-4">
      <StatsCards items={statItems} />
      <SubcategorySubmissionBars
        items={subcategorySubmissionStats}
        totalSubmittedCount={stats.submittedCount}
      />
      <SubcategoryAccuracyBars items={subcategoryAccuracyStats} />
    </section>
  );
}
