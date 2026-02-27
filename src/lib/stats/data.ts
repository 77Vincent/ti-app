import { readAuthenticatedUserId } from "@/app/api/test/session/auth";
import type { SubjectEnum } from "@/lib/meta";
import { SUBCATEGORIES } from "@/lib/meta/subcategories";
import { roundToOneDecimalPercent } from "./percent";
import {
  readStatsAggregates,
  readStatsTotals,
  type StatsAggregates,
  type StatsTotals,
} from "./repo";

export type SummaryStats = {
  submittedCount: number;
  correctCount: number;
  wrongCount: number;
  accuracyRatePercent: number;
};

export type SubcategorySubmissionStat = {
  label: string;
  subjectId: SubjectEnum;
  proportionPercent: number;
  submittedCount: number;
};

export type SubcategoryAccuracyStat = {
  label: string;
  subjectId: SubjectEnum;
  proportionPercent: number;
  accuracyRatePercent: number;
  submittedCount: number;
  correctCount: number;
};

export type StatsPayload = {
  stats: SummaryStats;
  subcategorySubmissionStats: SubcategorySubmissionStat[];
  subcategoryAccuracyStats: SubcategoryAccuracyStat[];
};

const ORDERED_SUBCATEGORIES = [...SUBCATEGORIES].sort(
  (first, second) => first.order - second.order,
);
const TOP_SUBCATEGORY_LIMIT = 5;

function buildSubcategorySubmissionStats(
  submittedCountBySubcategoryId: Map<string, number>,
  totalSubmittedCount: number,
): SubcategorySubmissionStat[] {
  return ORDERED_SUBCATEGORIES.map((subcategory) => {
    const submittedCount = submittedCountBySubcategoryId.get(subcategory.id) ?? 0;
    const proportionPercent =
      totalSubmittedCount === 0
        ? 0
        : roundToOneDecimalPercent(submittedCount / totalSubmittedCount);

    return {
      label: subcategory.label,
      subjectId: subcategory.subjectId,
      proportionPercent,
      submittedCount,
      order: subcategory.order,
    };
  })
    .filter((item) => item.submittedCount > 0)
    .sort(
      (first, second) =>
        second.submittedCount - first.submittedCount || first.order - second.order,
    )
    .slice(0, TOP_SUBCATEGORY_LIMIT)
    .map(({ label, subjectId, proportionPercent, submittedCount }) => ({
      label,
      subjectId,
      proportionPercent,
      submittedCount,
    }));
}

function buildSubcategoryAccuracyStats(
  submittedCountBySubcategoryId: Map<string, number>,
  correctCountBySubcategoryId: Map<string, number>,
): SubcategoryAccuracyStat[] {
  const topAccuracyItems = ORDERED_SUBCATEGORIES.map((subcategory) => {
    const submittedCount = submittedCountBySubcategoryId.get(subcategory.id) ?? 0;
    const correctCount = correctCountBySubcategoryId.get(subcategory.id) ?? 0;
    const accuracyRatePercent =
      submittedCount === 0
        ? 0
        : roundToOneDecimalPercent(correctCount / submittedCount);

    return {
      label: subcategory.label,
      subjectId: subcategory.subjectId,
      submittedCount,
      correctCount,
      accuracyRatePercent,
      order: subcategory.order,
    };
  })
    .filter((item) => item.submittedCount > 0)
    .sort(
      (first, second) =>
        second.accuracyRatePercent - first.accuracyRatePercent ||
        second.submittedCount - first.submittedCount ||
        first.order - second.order,
    )
    .slice(0, TOP_SUBCATEGORY_LIMIT);

  const totalAccuracyRatePercent = topAccuracyItems.reduce(
    (sum, item) => sum + item.accuracyRatePercent,
    0,
  );

  return topAccuracyItems.map(
    ({
      label,
      subjectId,
      submittedCount,
      correctCount,
      accuracyRatePercent,
    }) => ({
      label,
      subjectId,
      proportionPercent:
        totalAccuracyRatePercent === 0
          ? 0
          : roundToOneDecimalPercent(
              accuracyRatePercent / totalAccuracyRatePercent,
            ),
      accuracyRatePercent,
      submittedCount,
      correctCount,
    }),
  );
}

export async function readUserStats(): Promise<StatsPayload> {
  const userId = await readAuthenticatedUserId();
  if (!userId) {
    throw new Error("Expected authenticated user in stats");
  }

  const aggregates = await readStatsAggregates({ userId });
  return buildStatsPayload(aggregates);
}

export async function readGlobalStats(): Promise<StatsPayload> {
  const aggregates = await readStatsAggregates();
  return buildStatsPayload(aggregates);
}

export async function readGlobalSummaryStats(): Promise<SummaryStats> {
  const totals = await readStatsTotals();
  return buildSummaryStats(totals);
}

function buildSummaryStats(totals: StatsTotals): SummaryStats {
  const submittedCount = totals.submittedCount;
  const correctCount = totals.correctCount;
  const wrongCount = submittedCount - correctCount;
  const accuracyRatePercent =
    submittedCount === 0
      ? 0
      : roundToOneDecimalPercent(correctCount / submittedCount);

  return {
    submittedCount,
    correctCount,
    wrongCount,
    accuracyRatePercent,
  };
}

function buildStatsPayload(
  aggregates: StatsAggregates,
): StatsPayload {
  const submittedCountBySubcategoryId = new Map<string, number>(
    aggregates.subcategoryStats.map((item) => [
      item.subcategoryId,
      item.submittedCount,
    ]),
  );
  const correctCountBySubcategoryId = new Map<string, number>(
    aggregates.subcategoryStats.map((item) => [
      item.subcategoryId,
      item.correctCount,
    ]),
  );
  const stats = buildSummaryStats({
    submittedCount: aggregates.submittedCount,
    correctCount: aggregates.correctCount,
  });

  return {
    stats,
    subcategorySubmissionStats: buildSubcategorySubmissionStats(
      submittedCountBySubcategoryId,
      stats.submittedCount,
    ),
    subcategoryAccuracyStats: buildSubcategoryAccuracyStats(
      submittedCountBySubcategoryId,
      correctCountBySubcategoryId,
    ),
  };
}
