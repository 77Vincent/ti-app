import type { TestParam } from "@/lib/testSession/validation";
import { prisma } from "@/lib/prisma";
import { getNextDifficultyByRecentAccuracy } from "@/lib/difficulty";
import type { SubcategoryEnum } from "@/lib/meta";

export type AuthTestSessionWhere = {
  userId: string;
};

export type AnonymousTestSessionWhere = {
  anonymousSessionId: string;
};

export type TestSessionIdentityWhere =
  | AuthTestSessionWhere
  | AnonymousTestSessionWhere;

export type AuthTestSessionContextWhere = AuthTestSessionWhere & {
  subjectId: string;
  subcategoryId: string;
};

export type TestSessionUpsertWhere =
  | AuthTestSessionContextWhere
  | AnonymousTestSessionWhere;

export type TestSessionReadWhere = TestSessionIdentityWhere & {
  id: string;
};

export type TestSessionReadByContextWhere = TestSessionIdentityWhere & {
  subjectId: string;
  subcategoryId: string;
};

const TEST_RUN_PARAMS_SELECT = {
  id: true,
  correctCount: true,
  submittedCount: true,
  subjectId: true,
  subcategoryId: true,
  difficulty: true,
} as const;

const TEST_SESSION_ADAPTIVE_SELECT = {
  id: true,
  subcategoryId: true,
  difficulty: true,
  difficultyCooldownRemaining: true,
  recentOutcomes: true,
} as const;

function isAuthTestSessionWhere(
  where:
    | TestSessionIdentityWhere
    | TestSessionUpsertWhere
    | TestSessionReadByContextWhere
    | TestSessionReadWhere,
): where is AuthTestSessionWhere {
  return "userId" in where;
}

function toIdentityWhere(
  where:
    | TestSessionIdentityWhere
    | TestSessionUpsertWhere
    | TestSessionReadByContextWhere
    | TestSessionReadWhere,
): TestSessionIdentityWhere {
  return isAuthTestSessionWhere(where)
    ? { userId: where.userId }
    : { anonymousSessionId: where.anonymousSessionId };
}

export async function readTestSession(
  where: TestSessionReadWhere,
) {
  return prisma.testSession.findFirst({
    where: {
      id: where.id,
      ...toIdentityWhere(where),
    },
    select: TEST_RUN_PARAMS_SELECT,
  });
}

export async function readTestSessionByContext(
  where: TestSessionReadByContextWhere,
) {
  return prisma.testSession.findFirst({
    where: {
      subjectId: where.subjectId,
      subcategoryId: where.subcategoryId,
      ...toIdentityWhere(where),
    },
    select: TEST_RUN_PARAMS_SELECT,
  });
}

export async function upsertTestSession(
  where: TestSessionUpsertWhere,
  id: string,
  params: TestParam,
) {
  if (isAuthTestSessionWhere(where)) {
    try {
      return await prisma.testSession.create({
        data: {
          id,
          correctCount: 0,
          submittedCount: 0,
          subjectId: params.subjectId,
          subcategoryId: params.subcategoryId,
          difficulty: params.difficulty,
          difficultyCooldownRemaining: 0,
          recentOutcomes: [],
          userId: where.userId,
        },
        select: TEST_RUN_PARAMS_SELECT,
      });
    } catch (error) {
      const code = (error as { code?: unknown } | null)?.code;
      if (code !== "P2002") {
        throw error;
      }

      const existing = await prisma.testSession.findFirst({
        where: {
          userId: where.userId,
          subjectId: where.subjectId,
          subcategoryId: where.subcategoryId,
        },
        select: TEST_RUN_PARAMS_SELECT,
      });
      if (existing) {
        return existing;
      }

      throw error;
    }
  }

  return prisma.testSession.upsert({
    where: {
      anonymousSessionId: where.anonymousSessionId,
    },
    create: {
      id,
      anonymousSessionId: where.anonymousSessionId,
      correctCount: 0,
      submittedCount: 0,
      subjectId: params.subjectId,
      subcategoryId: params.subcategoryId,
      difficulty: params.difficulty,
      difficultyCooldownRemaining: 0,
      recentOutcomes: [],
    },
    update: {
      id,
      correctCount: 0,
      submittedCount: 0,
      subjectId: params.subjectId,
      subcategoryId: params.subcategoryId,
      difficulty: params.difficulty,
      difficultyCooldownRemaining: 0,
      recentOutcomes: [],
    },
    select: TEST_RUN_PARAMS_SELECT,
  });
}

export async function incrementTestSessionProgress(
  where: TestSessionReadWhere,
  isCorrect: boolean,
  maxSubmittedCountExclusive?: number,
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
      id: where.id,
      ...toIdentityWhere(where),
      ...(typeof maxSubmittedCountExclusive === "number"
        ? {
            submittedCount: {
              lt: maxSubmittedCountExclusive,
            },
          }
        : {}),
    },
    data,
  });

  return result.count;
}

export async function updateTestSessionDifficultyByRecentAccuracy(
  where: TestSessionReadWhere,
  isCorrect: boolean,
) {
  const session = await prisma.testSession.findFirst({
    where: {
      id: where.id,
      ...toIdentityWhere(where),
    },
    select: TEST_SESSION_ADAPTIVE_SELECT,
  });
  if (!session) {
    return null;
  }

  const adaptiveResult = getNextDifficultyByRecentAccuracy({
    subcategoryId: session.subcategoryId as SubcategoryEnum,
    currentDifficulty: session.difficulty,
    recentOutcomes: session.recentOutcomes,
    difficultyCooldownRemaining: session.difficultyCooldownRemaining,
    isCorrect,
  });

  return prisma.testSession.update({
    where: {
      id: session.id,
    },
    data: {
      difficulty: adaptiveResult.difficulty,
      difficultyCooldownRemaining: adaptiveResult.difficultyCooldownRemaining,
      recentOutcomes: adaptiveResult.recentOutcomes,
    },
    select: TEST_RUN_PARAMS_SELECT,
  });
}

export async function deleteTestSession(
  where: TestSessionIdentityWhere,
): Promise<void> {
  await prisma.testSession.deleteMany({
    where: toIdentityWhere(where),
  });
}
