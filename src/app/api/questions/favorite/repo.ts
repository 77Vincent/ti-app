import { prisma } from "@/lib/prisma";
import type {
  SubjectEnum,
  SubcategoryEnum,
} from "@/lib/meta";
import type { QuestionOptionIndex } from "@/lib/question/model";

type FavoriteOption = {
  text: string;
  explanation: string;
};

export type FavoriteQuestionInput = {
  questionId: string;
  subjectId: SubjectEnum;
  subcategoryId: SubcategoryEnum;
  prompt: string;
  difficulty: string;
  options: readonly FavoriteOption[];
  correctOptionIndexes: readonly QuestionOptionIndex[];
};

export async function upsertFavoriteQuestion(
  userId: string,
  input: FavoriteQuestionInput,
): Promise<void> {
  await prisma.favoriteQuestion.upsert({
    where: {
      userId_questionId: {
        userId,
        questionId: input.questionId,
      },
    },
    create: {
      userId,
      questionId: input.questionId,
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
