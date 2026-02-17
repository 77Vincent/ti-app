import type { TestParam } from "@/lib/testSession/validation";
import { prisma } from "@/lib/prisma";

export type AuthTestSessionWhere = {
  userId: string;
};

export type AnonymousTestSessionWhere = {
  anonymousSessionId: string;
};

export type TestSessionWhere = AuthTestSessionWhere | AnonymousTestSessionWhere;
export type IncrementProgressOptions = {
  maxSubmittedCountExclusive?: number;
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

function isAuthTestSessionWhere(
  where: TestSessionWhere,
): where is AuthTestSessionWhere {
  return "userId" in where;
}

export async function readTestSession(
  where: TestSessionWhere,
) {
  return prisma.testSession.findUnique({
    where,
    select: TEST_RUN_PARAMS_SELECT,
  });
}

export async function upsertTestSession(
  where: TestSessionWhere,
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
      ...(isAuthTestSessionWhere(where)
        ? { userId: where.userId }
        : { anonymousSessionId: where.anonymousSessionId }),
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
  where: TestSessionWhere,
  isCorrect: boolean,
  options?: IncrementProgressOptions,
): Promise<number> {
  const data = {
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
  };

  const result = await prisma.testSession.updateMany({
    where: {
      ...where,
      ...(typeof options?.maxSubmittedCountExclusive === "number"
        ? {
            submittedCount: {
              lt: options.maxSubmittedCountExclusive,
            },
          }
        : {}),
    },
    data,
  });

  return result.count;
}

export async function deleteTestSession(
  where: TestSessionWhere,
): Promise<void> {
  await prisma.testSession.deleteMany({
    where,
  });
}
