import type { SummaryStats } from "./data";
import { formatPercent } from "./percent";

export type StatsCardItem = {
  label: string;
  value: string;
};

export function buildStatsCardItems(stats: SummaryStats): StatsCardItem[] {
  return [
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
  ];
}
