import type { TestParam } from "@/lib/validation/testSession";
import { prisma } from "@/lib/prisma";

export type UserTestSessionWhere = {
  userId: string;
};

const TEST_RUN_PARAMS_SELECT = {
  id: true,
  correctCount: true,
  difficulty: true,
  goal: true,
  startedAt: true,
  submittedCount: true,
  subjectId: true,
  subcategoryId: true,
} as const;

export async function readTestSession(
  where: UserTestSessionWhere,
): Promise<{
  id: string;
  correctCount: number;
  difficulty: string;
  goal: string;
  startedAt: Date;
  submittedCount: number;
  subjectId: string;
  subcategoryId: string;
} | null> {
  return prisma.testSession.findUnique({
    where,
    select: TEST_RUN_PARAMS_SELECT,
  });
}

export async function upsertTestSession(
  where: UserTestSessionWhere,
  id: string,
  params: TestParam,
  startedAt: Date,
): Promise<void> {
  await prisma.testSession.upsert({
    where,
    create: {
      id: id,
      correctCount: 0,
      difficulty: params.difficulty,
      goal: params.goal,
      startedAt,
      submittedCount: 0,
      subjectId: params.subjectId,
      subcategoryId: params.subcategoryId,
      userId: where.userId,
    },
    update: {
      correctCount: 0,
      id: id,
      difficulty: params.difficulty,
      goal: params.goal,
      startedAt,
      submittedCount: 0,
      subjectId: params.subjectId,
      subcategoryId: params.subcategoryId,
    },
  });
}

export async function incrementTestSessionProgress(
  where: UserTestSessionWhere,
  isCorrect: boolean,
): Promise<void> {
  await prisma.testSession.updateMany({
    where,
    data: {
      submittedCount: {
        increment: 1,
      },
      ...(isCorrect
        ? {
            correctCount: {
              increment: 1,
            },
          }
        : {}),
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
