import { readAuthenticatedUserId } from "@/app/api/test/session/auth";
import { SUBCATEGORIES } from "@/lib/meta/subcategories";
import { roundToOneDecimalPercent } from "./format";
import { readDashboardSessions } from "./repo";

export type DashboardStats = {
  submittedCount: number;
  correctCount: number;
  wrongCount: number;
  accuracyRatePercent: number;
};

export type SubcategorySubmissionStat = {
  label: string;
  proportionPercent: number;
  submittedCount: number;
};

export type DashboardStatsPayload = {
  stats: DashboardStats;
  subcategorySubmissionStats: SubcategorySubmissionStat[];
};

const ORDERED_SUBCATEGORIES = [...SUBCATEGORIES].sort(
  (first, second) => first.order - second.order,
);

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
      proportionPercent,
      submittedCount,
    };
  });
}

export async function readDashboardStats(): Promise<DashboardStatsPayload> {
  const userId = await readAuthenticatedUserId();
  if (!userId) {
    throw new Error("Expected authenticated user in dashboard stats");
  }

  const sessions = await readDashboardSessions(userId);
  const { submittedCount, correctCount, submittedCountBySubcategoryId } =
    sessions.reduce(
      (acc, session) => {
        acc.submittedCount += session.submittedCount;
        acc.correctCount += session.correctCount;

        const current = acc.submittedCountBySubcategoryId.get(session.subcategoryId) ?? 0;
        acc.submittedCountBySubcategoryId.set(
          session.subcategoryId,
          current + session.submittedCount,
        );

        return acc;
      },
      {
        submittedCount: 0,
        correctCount: 0,
        submittedCountBySubcategoryId: new Map<string, number>(),
      },
    );
  const wrongCount = submittedCount - correctCount;
  const accuracyRatePercent =
    submittedCount === 0
      ? 0
      : roundToOneDecimalPercent(correctCount / submittedCount);

  return {
    stats: {
      submittedCount,
      correctCount,
      wrongCount,
      accuracyRatePercent,
    },
    subcategorySubmissionStats: buildSubcategorySubmissionStats(
      submittedCountBySubcategoryId,
      submittedCount,
    ),
  };
}
