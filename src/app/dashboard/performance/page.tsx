"use client";

import { StatsCards } from "@/app/components";
import { buildStatsCardItems } from "@/lib/stats/cards";
import type { SummaryStats } from "@/lib/stats/data";
import SubcategoryAccuracyBars from "./SubcategoryAccuracyBars";
import SubcategorySubmissionBars from "./SubcategorySubmissionBars";
import { usePerformanceStats } from "./usePerformanceStats";

const EMPTY_STATS: SummaryStats = {
  submittedCount: 0,
  correctCount: 0,
  wrongCount: 0,
  accuracyRatePercent: 0,
};

export default function DashboardPerformancePage() {
  const { payload, isLoading, loadError } = usePerformanceStats();
  const stats = payload?.stats ?? EMPTY_STATS;
  const subcategorySubmissionStats = payload?.subcategorySubmissionStats ?? [];
  const subcategoryAccuracyStats = payload?.subcategoryAccuracyStats ?? [];
  const statItems = buildStatsCardItems(stats);

  return (
    <section className="space-y-4">
      <StatsCards items={statItems} />
      <SubcategorySubmissionBars
        items={subcategorySubmissionStats}
        totalSubmittedCount={stats.submittedCount}
        isLoading={isLoading}
      />
      <SubcategoryAccuracyBars
        items={subcategoryAccuracyStats}
        isLoading={isLoading}
      />
      {!isLoading && !payload ? (
        <p className="text-danger text-sm">
          {loadError ?? "Failed to load performance."}
        </p>
      ) : null}
    </section>
  );
}
