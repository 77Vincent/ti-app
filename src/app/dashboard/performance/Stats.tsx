import SubcategorySubmissionBars from "./SubcategorySubmissionBars";
import StatsCards from "./StatsCards";
import { readDashboardStats } from "./statsData";

function formatAccuracy(accuracyRatePercent: number): string {
  if (Number.isInteger(accuracyRatePercent)) {
    return `${accuracyRatePercent}%`;
  }

  return `${accuracyRatePercent.toFixed(1)}%`;
}

export default async function Stats() {
  const { stats, subcategorySubmissionStats } = await readDashboardStats();

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
      value: formatAccuracy(stats.accuracyRatePercent),
    },
  ] as const;

  return (
    <section className="space-y-4">
      <StatsCards items={statItems} />
      <SubcategorySubmissionBars
        items={subcategorySubmissionStats}
        totalSubmittedCount={stats.submittedCount}
      />
    </section>
  );
}
