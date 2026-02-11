import type { TestRunParams } from "@/app/test/run/questionRunner/session/params";
import { prisma } from "@/lib/prisma";

export type UserTestSessionWhere = {
  userId: string;
};

const TEST_RUN_PARAMS_SELECT = {
  difficulty: true,
  subjectId: true,
  subcategoryId: true,
} as const;

export async function readTestSession(
  where: UserTestSessionWhere,
): Promise<{ difficulty: string; subjectId: string; subcategoryId: string } | null> {
  return prisma.testSession.findUnique({
    where,
    select: TEST_RUN_PARAMS_SELECT,
  });
}

export async function upsertTestSession(
  where: UserTestSessionWhere,
  params: TestRunParams,
): Promise<void> {
  await prisma.testSession.upsert({
    where,
    create: {
      difficulty: params.difficulty,
      subjectId: params.subjectId,
      subcategoryId: params.subcategoryId,
      userId: where.userId,
    },
    update: {
      difficulty: params.difficulty,
      subjectId: params.subjectId,
      subcategoryId: params.subcategoryId,
    },
  });
}

export async function deleteTestSession(
  where: UserTestSessionWhere,
): Promise<void> {
  await prisma.testSession.deleteMany({
    where,
  });
}
