import type { TestParam } from "@/lib/testSession/validation";
import { prisma } from "@/lib/prisma";

export type AuthTestSessionWhere = {
  userId: string;
};

export type AnonymousTestSessionWhere = {
  anonymousSessionId: string;
};

export type TestSessionWhere =
  | AuthTestSessionWhere
  | AnonymousTestSessionWhere;

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
  if (isAuthTestSessionWhere(where)) {
    return prisma.testSession.findUnique({
      where,
      select: TEST_RUN_PARAMS_SELECT,
    });
  }

  return prisma.anonymousTestSession.findUnique({
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
  if (isAuthTestSessionWhere(where)) {
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
    return;
  }

  await prisma.anonymousTestSession.upsert({
    where,
    create: {
      id: id,
      anonymousSessionId: where.anonymousSessionId,
      correctCount: 0,
      difficulty: params.difficulty,
      goal: params.goal,
      startedAt,
      submittedCount: 0,
      subjectId: params.subjectId,
      subcategoryId: params.subcategoryId,
    },
    update: {
      id: id,
      difficulty: params.difficulty,
      goal: params.goal,
      startedAt,
      subjectId: params.subjectId,
      subcategoryId: params.subcategoryId,
    },
  });
}

export async function incrementTestSessionProgress(
  where: TestSessionWhere,
  isCorrect: boolean,
): Promise<void> {
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

  if (isAuthTestSessionWhere(where)) {
    await prisma.testSession.updateMany({
      where,
      data,
    });
    return;
  }

  await prisma.anonymousTestSession.updateMany({
    where,
    data,
  });
}

export async function deleteTestSession(
  where: TestSessionWhere,
): Promise<void> {
  if (isAuthTestSessionWhere(where)) {
    await prisma.testSession.deleteMany({
      where,
    });
    return;
  }

  await prisma.anonymousTestSession.deleteMany({
    where,
  });
}
