import { readAuthenticatedUserId } from "@/app/api/test/session/auth";
import { SUBCATEGORIES } from "@/lib/meta/subcategories";
import { prisma } from "@/lib/prisma";

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
        : Math.round((submittedCount / totalSubmittedCount) * 1000) / 10;

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

  const sessions = await prisma.testSession.findMany({
    where: {
      userId,
    },
    select: {
      correctCount: true,
      submittedCount: true,
      subcategoryId: true,
    },
  });
  const submittedCount = sessions.reduce(
    (sum, session) => sum + session.submittedCount,
    0,
  );
  const correctCount = sessions.reduce(
    (sum, session) => sum + session.correctCount,
    0,
  );
  const submittedCountBySubcategoryId = sessions.reduce((acc, session) => {
    const current = acc.get(session.subcategoryId) ?? 0;
    acc.set(session.subcategoryId, current + session.submittedCount);
    return acc;
  }, new Map<string, number>());
  const wrongCount = submittedCount - correctCount;
  const accuracyRatePercent =
    submittedCount === 0
      ? 0
      : Math.round((correctCount / submittedCount) * 1000) / 10;

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
