import SubcategorySubmissionBars from "./SubcategorySubmissionBars";
import SubcategoryAccuracyBars from "./SubcategoryAccuracyBars";
import { StatsCards } from "@/app/components";
import { buildStatsCardItems } from "@/lib/stats/cards";
import { readUserStats } from "@/lib/stats/data";

export default async function DashboardPerformancePage() {
  const { stats, subcategorySubmissionStats, subcategoryAccuracyStats } =
    await readUserStats();
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
