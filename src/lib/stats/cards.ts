import type { SummaryStats } from "./data";
import { formatPercent } from "./percent";

export type StatsCardItem = {
  icon: "submitted" | "correct" | "wrong" | "accuracy";
  label: string;
  value: string;
};

export function buildStatsCardItems(stats: SummaryStats): StatsCardItem[] {
  return [
    {
      icon: "submitted",
      label: "Total submitted",
      value: stats.submittedCount.toLocaleString(),
    },
    {
      icon: "correct",
      label: "Total correct",
      value: stats.correctCount.toLocaleString(),
    },
    {
      icon: "wrong",
      label: "Total wrong",
      value: stats.wrongCount.toLocaleString(),
    },
    {
      icon: "accuracy",
      label: "Accuracy",
      value: formatPercent(stats.accuracyRatePercent),
    },
  ];
}
