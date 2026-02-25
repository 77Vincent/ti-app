import { readAuthenticatedUserId } from "@/app/api/test/session/auth";
import { SUBCATEGORIES } from "@/lib/meta/subcategories";
import { prisma } from "@/lib/prisma";
import SubcategorySubmissionBars from "./SubcategorySubmissionBars";
import StatsCards from "./StatsCards";

type DashboardStats = {
  submittedCount: number;
  correctCount: number;
  wrongCount: number;
  accuracyRatePercent: number;
};

const EMPTY_DASHBOARD_STATS: DashboardStats = {
  submittedCount: 0,
  correctCount: 0,
  wrongCount: 0,
  accuracyRatePercent: 0,
};

type SubcategorySubmissionStat = {
  label: string;
  proportionPercent: number;
  submittedCount: number;
};

type DashboardStatsPayload = {
  stats: DashboardStats;
  subcategorySubmissionStats: SubcategorySubmissionStat[];
};

function formatAccuracy(accuracyRatePercent: number): string {
  if (Number.isInteger(accuracyRatePercent)) {
    return `${accuracyRatePercent}%`;
  }

  return `${accuracyRatePercent.toFixed(1)}%`;
}

function buildSubcategorySubmissionStats(
  submittedCountBySubcategoryId: Map<string, number>,
  totalSubmittedCount: number,
): SubcategorySubmissionStat[] {
  return [...SUBCATEGORIES]
    .sort((first, second) => first.order - second.order)
    .map((subcategory) => {
      const submittedCount =
        submittedCountBySubcategoryId.get(subcategory.id) ?? 0;
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

async function readDashboardStats(): Promise<DashboardStatsPayload> {
  const userId = await readAuthenticatedUserId();
  if (!userId) {
    return {
      stats: EMPTY_DASHBOARD_STATS,
      subcategorySubmissionStats: buildSubcategorySubmissionStats(new Map(), 0),
    };
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
  const wrongCount = Math.max(submittedCount - correctCount, 0);
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
