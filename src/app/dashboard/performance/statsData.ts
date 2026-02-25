import { readAuthenticatedUserId } from "@/app/api/test/session/auth";
import { SUBCATEGORIES } from "@/lib/meta/subcategories";
import type { SubjectEnum } from "@/lib/meta";
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

export type SubcategoryAccuracyStat = {
  label: string;
  subjectId: SubjectEnum;
  proportionPercent: number;
  accuracyRatePercent: number;
  submittedCount: number;
  correctCount: number;
};

export type DashboardStatsPayload = {
  stats: DashboardStats;
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
    .map(({ label, proportionPercent, submittedCount }) => ({
      label,
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

export async function readDashboardStats(): Promise<DashboardStatsPayload> {
  const userId = await readAuthenticatedUserId();
  if (!userId) {
    throw new Error("Expected authenticated user in dashboard stats");
  }

  const sessions = await readDashboardSessions(userId);
  const {
    submittedCount,
    correctCount,
    submittedCountBySubcategoryId,
    correctCountBySubcategoryId,
  } =
    sessions.reduce(
      (acc, session) => {
        acc.submittedCount += session.submittedCount;
        acc.correctCount += session.correctCount;

        const current = acc.submittedCountBySubcategoryId.get(session.subcategoryId) ?? 0;
        acc.submittedCountBySubcategoryId.set(
          session.subcategoryId,
          current + session.submittedCount,
        );
        const currentCorrectCount =
          acc.correctCountBySubcategoryId.get(session.subcategoryId) ?? 0;
        acc.correctCountBySubcategoryId.set(
          session.subcategoryId,
          currentCorrectCount + session.correctCount,
        );

        return acc;
      },
      {
        submittedCount: 0,
        correctCount: 0,
        submittedCountBySubcategoryId: new Map<string, number>(),
        correctCountBySubcategoryId: new Map<string, number>(),
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
    subcategoryAccuracyStats: buildSubcategoryAccuracyStats(
      submittedCountBySubcategoryId,
      correctCountBySubcategoryId,
    ),
  };
}
