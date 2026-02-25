import { prisma } from "@/lib/prisma";

export type FavoriteQuestionPreview = {
  id: string;
  prompt: string;
  options: string[];
};

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

export async function readFavoriteQuestions(
  userId: string,
  subjectId: string,
  subcategoryId?: string,
): Promise<FavoriteQuestionPreview[]> {
  const favorites = await prisma.favoriteQuestion.findMany({
    where: {
      userId,
      question: {
        subjectId,
        ...(subcategoryId
          ? {
              subcategoryId,
            }
          : {}),
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      question: {
        select: {
          id: true,
          prompt: true,
          options: true,
        },
      },
    },
  });

  return favorites.map((favorite) => ({
    id: favorite.question.id,
    prompt: favorite.question.prompt,
    options: (favorite.question.options as Array<{ text: string }>).map(
      (option) => option.text,
    ),
  }));
}
