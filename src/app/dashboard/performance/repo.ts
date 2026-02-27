import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type DashboardSubcategoryAggregateRow = {
  subcategoryId: string;
  submittedCount: number;
  correctCount: number;
};

export type DashboardAggregates = {
  submittedCount: number;
  correctCount: number;
  subcategoryStats: DashboardSubcategoryAggregateRow[];
};

export type DashboardTotals = {
  submittedCount: number;
  correctCount: number;
};

export async function readDashboardTotals(
  where?: Prisma.TestSessionWhereInput,
): Promise<DashboardTotals> {
  const summary = await prisma.testSession.aggregate({
    where,
    _sum: {
      submittedCount: true,
      correctCount: true,
    },
  });

  return {
    submittedCount: summary._sum.submittedCount ?? 0,
    correctCount: summary._sum.correctCount ?? 0,
  };
}

export async function readDashboardAggregates(
  where?: Prisma.TestSessionWhereInput,
): Promise<DashboardAggregates> {
  const [totals, subcategoryGroups] = await Promise.all([
    readDashboardTotals(where),
    prisma.testSession.groupBy({
      by: ["subcategoryId"],
      where,
      _sum: {
        submittedCount: true,
        correctCount: true,
      },
    }),
  ]);

  return {
    submittedCount: totals.submittedCount,
    correctCount: totals.correctCount,
    subcategoryStats: subcategoryGroups.map((group) => ({
      subcategoryId: group.subcategoryId,
      submittedCount: group._sum.submittedCount ?? 0,
      correctCount: group._sum.correctCount ?? 0,
    })),
  };
}
