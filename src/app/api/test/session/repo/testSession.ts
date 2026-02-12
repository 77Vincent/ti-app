import type { TestParam } from "@/lib/validation/testSession";
import { prisma } from "@/lib/prisma";

export type UserTestSessionWhere = {
  userId: string;
};

const TEST_RUN_PARAMS_SELECT = {
  id: true,
  difficulty: true,
  goal: true,
  updatedAt: true,
  subjectId: true,
  subcategoryId: true,
} as const;

export async function readTestSession(
  where: UserTestSessionWhere,
): Promise<{
  id: string;
  difficulty: string;
  goal: string;
  updatedAt: Date;
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
): Promise<void> {
  await prisma.testSession.upsert({
    where,
    create: {
      id: id,
      difficulty: params.difficulty,
      goal: params.goal,
      subjectId: params.subjectId,
      subcategoryId: params.subcategoryId,
      userId: where.userId,
    },
    update: {
      id: id,
      difficulty: params.difficulty,
      goal: params.goal,
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
