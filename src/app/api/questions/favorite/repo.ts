import { prisma } from "@/lib/prisma";

export async function upsertFavoriteQuestion(
  userId: string,
  questionId: string,
): Promise<void> {
  await prisma.favoriteQuestion.upsert({
    where: {
      userId_questionId: {
        userId,
        questionId,
      },
    },
    create: {
      userId,
      questionId,
    },
    update: {},
  });
}

export async function deleteFavoriteQuestion(
  userId: string,
  questionId: string,
): Promise<void> {
  await prisma.favoriteQuestion.deleteMany({
    where: {
      userId,
      questionId,
    },
  });
}

export async function isQuestionFavorited(
  userId: string,
  questionId: string,
): Promise<boolean> {
  const favorite = await prisma.favoriteQuestion.findUnique({
    where: {
      userId_questionId: {
        userId,
        questionId,
      },
    },
    select: {
      questionId: true,
    },
  });

  return Boolean(favorite);
}
