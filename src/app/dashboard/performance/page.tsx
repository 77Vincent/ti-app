import SubcategorySubmissionBars from "./SubcategorySubmissionBars";
import SubcategoryAccuracyBars from "./SubcategoryAccuracyBars";
import { StatsCards } from "@/app/components";
import { formatPercent } from "@/lib/stats/percent";
import { readDashboardStats } from "@/lib/stats/data";

export default async function DashboardPerformancePage() {
  const { stats, subcategorySubmissionStats, subcategoryAccuracyStats } =
    await readDashboardStats();

  const statItems = [
    {
      label: "Total submitted questions",
      value: stats.submittedCount.toLocaleString(),
    },
    {
      label: "Total correct answer",
      value: stats.correctCount.toLocaleString(),
    },
    {
      label: "Total wrong answer",
      value: stats.wrongCount.toLocaleString(),
    },
    {
      label: "Average accuracy",
      value: formatPercent(stats.accuracyRatePercent),
    },
  ] as const;

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
