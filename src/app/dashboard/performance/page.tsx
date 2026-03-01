"use client";

import { StatsCards } from "@/app/components";
import { buildStatsCardItems } from "@/lib/stats/cards";
import SubcategoryAccuracyBars from "./SubcategoryAccuracyBars";
import SubcategorySubmissionBars from "./SubcategorySubmissionBars";
import { usePerformanceStats } from "./usePerformanceStats";

export default function DashboardPerformancePage() {
  const { payload, isLoading, loadError } = usePerformanceStats();

  if (isLoading && !payload) {
    return <p className="text-default-500">Loading...</p>;
  }

  if (!payload) {
    return (
      <p className="text-danger text-sm">
        {loadError ?? "Failed to load performance."}
      </p>
    );
  }

  const { stats, subcategorySubmissionStats, subcategoryAccuracyStats } =
    payload;
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
