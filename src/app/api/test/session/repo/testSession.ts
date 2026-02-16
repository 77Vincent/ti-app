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

const TEST_SESSION_ID_SELECT = {
  id: true,
} as const;

function isAuthTestSessionWhere(
  where: TestSessionWhere,
): where is AuthTestSessionWhere {
  return "userId" in where;
}

async function readPersistedSessionId(
  where: TestSessionWhere,
): Promise<string | null> {
  if (isAuthTestSessionWhere(where)) {
    const session = await prisma.testSession.findUnique({
      where,
      select: TEST_SESSION_ID_SELECT,
    });
    return session?.id ?? null;
  }

  const session = await prisma.anonymousTestSession.findUnique({
    where,
    select: TEST_SESSION_ID_SELECT,
  });
  return session?.id ?? null;
}

async function clearTestSessionQuestionPool(sessionId: string): Promise<void> {
  await prisma.testSessionQuestionPool.deleteMany({
    where: {
      sessionId,
    },
  });
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

export async function isTestSessionActive(sessionId: string): Promise<boolean> {
  const [authSession, anonymousSession] = await Promise.all([
    prisma.testSession.findUnique({
      where: { id: sessionId },
      select: TEST_SESSION_ID_SELECT,
    }),
    prisma.anonymousTestSession.findUnique({
      where: { id: sessionId },
      select: TEST_SESSION_ID_SELECT,
    }),
  ]);

  return Boolean(authSession || anonymousSession);
}

export async function upsertTestSession(
  where: TestSessionWhere,
  id: string,
  params: TestParam,
  startedAt: Date,
): Promise<void> {
  const persistedSessionId = await readPersistedSessionId(where);
  if (persistedSessionId && persistedSessionId !== id) {
    await clearTestSessionQuestionPool(persistedSessionId);
  }

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
  const persistedSessionId = await readPersistedSessionId(where);
  if (persistedSessionId) {
    await clearTestSessionQuestionPool(persistedSessionId);
  }

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
