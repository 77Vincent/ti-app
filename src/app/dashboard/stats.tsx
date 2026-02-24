import { readAuthenticatedUserId } from "@/app/api/test/session/auth";
import { prisma } from "@/lib/prisma";
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

function formatAccuracy(accuracyRatePercent: number): string {
  if (Number.isInteger(accuracyRatePercent)) {
    return `${accuracyRatePercent}%`;
  }

  return `${accuracyRatePercent.toFixed(1)}%`;
}

async function readDashboardStats(): Promise<DashboardStats> {
  const userId = await readAuthenticatedUserId();
  if (!userId) {
    return EMPTY_DASHBOARD_STATS;
  }

  const aggregate = await prisma.testSession.aggregate({
    where: {
      userId,
    },
    _sum: {
      submittedCount: true,
      correctCount: true,
    },
  });
  const submittedCount = aggregate._sum.submittedCount ?? 0;
  const correctCount = aggregate._sum.correctCount ?? 0;
  const wrongCount = Math.max(submittedCount - correctCount, 0);
  const accuracyRatePercent =
    submittedCount === 0
      ? 0
      : Math.round((correctCount / submittedCount) * 1000) / 10;

  return {
    submittedCount,
    correctCount,
    wrongCount,
    accuracyRatePercent,
  };
}

export default async function Stats() {
  const stats = await readDashboardStats();

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

  return <StatsCards items={statItems} />;
}
