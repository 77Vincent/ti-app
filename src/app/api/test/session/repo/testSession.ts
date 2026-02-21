import type { TestParam } from "@/lib/testSession/validation";
import { prisma } from "@/lib/prisma";

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

const TEST_RUN_PARAMS_SELECT = {
  id: true,
  correctCount: true,
  startedAt: true,
  submittedCount: true,
  subjectId: true,
  subcategoryId: true,
} as const;

function isAuthTestSessionWhere(
  where:
    | TestSessionIdentityWhere
    | TestSessionUpsertWhere
    | TestSessionReadWhere,
): where is AuthTestSessionWhere {
  return "userId" in where;
}

function toIdentityWhere(
  where:
    | TestSessionIdentityWhere
    | TestSessionUpsertWhere
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

export async function upsertTestSession(
  where: TestSessionUpsertWhere,
  id: string,
  params: TestParam,
  startedAt: Date,
) {
  if (isAuthTestSessionWhere(where)) {
    try {
      return await prisma.testSession.create({
        data: {
          id,
          correctCount: 0,
          startedAt,
          submittedCount: 0,
          subjectId: params.subjectId,
          subcategoryId: params.subcategoryId,
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
      startedAt,
      submittedCount: 0,
      subjectId: params.subjectId,
      subcategoryId: params.subcategoryId,
    },
    update: {
      id,
      correctCount: 0,
      startedAt,
      submittedCount: 0,
      subjectId: params.subjectId,
      subcategoryId: params.subcategoryId,
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

export async function deleteTestSession(
  where: TestSessionIdentityWhere,
): Promise<void> {
  await prisma.testSession.deleteMany({
    where: toIdentityWhere(where),
  });
}
