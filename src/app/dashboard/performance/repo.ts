import { prisma } from "@/lib/prisma";

export type DashboardSessionRow = {
  subcategoryId: string;
  submittedCount: number;
  correctCount: number;
};

const DASHBOARD_SESSION_SELECT = {
  subcategoryId: true,
  submittedCount: true,
  correctCount: true,
} as const;

export async function readDashboardSessions(
  userId: string,
): Promise<DashboardSessionRow[]> {
  return prisma.testSession.findMany({
    where: {
      userId,
    },
    select: DASHBOARD_SESSION_SELECT,
  });
}
