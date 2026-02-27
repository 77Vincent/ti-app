import type { SummaryStats } from "./data";
import { formatPercent } from "./percent";

export type StatsCardItem = {
  label: string;
  value: string;
};

export function buildStatsCardItems(stats: SummaryStats): StatsCardItem[] {
  return [
    {
      label: "Total submitted",
      value: stats.submittedCount.toLocaleString(),
    },
    {
      label: "Total correct",
      value: stats.correctCount.toLocaleString(),
    },
    {
      label: "Total wrong",
      value: stats.wrongCount.toLocaleString(),
    },
    {
      label: "Accuracy",
      value: formatPercent(stats.accuracyRatePercent),
    },
  ];
}
