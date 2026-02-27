import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type SubcategoryAggregateRow = {
  subcategoryId: string;
  submittedCount: number;
  correctCount: number;
};

export type StatsAggregates = {
  submittedCount: number;
  correctCount: number;
  subcategoryStats: SubcategoryAggregateRow[];
};

export type StatsTotals = {
  submittedCount: number;
  correctCount: number;
};

export async function readStatsTotals(
  where?: Prisma.TestSessionWhereInput,
): Promise<StatsTotals> {
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

export async function readStatsAggregates(
  where?: Prisma.TestSessionWhereInput,
): Promise<StatsAggregates> {
  const [totals, subcategoryGroups] = await Promise.all([
    readStatsTotals(where),
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
