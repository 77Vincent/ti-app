import { prisma } from "@/lib/prisma";
import type {
  DifficultyEnum,
  QuestionType,
  SubjectEnum,
  SubcategoryEnum,
} from "@/lib/meta";
import type { QuestionOptionId } from "@/lib/question/validation";
import { mapFavoriteQuestionToQuestionPoolInput } from "../pool/input";
import { upsertQuestionPool } from "../pool/repo";

type FavoriteOption = {
  id: QuestionOptionId;
  text: string;
  explanation: string;
};

export type FavoriteQuestionInput = {
  questionId: string;
  subjectId: SubjectEnum;
  subcategoryId: SubcategoryEnum;
  difficulty: DifficultyEnum;
  questionType: QuestionType;
  prompt: string;
  options: readonly FavoriteOption[];
  correctOptionIds: readonly QuestionOptionId[];
};

export async function upsertFavoriteQuestion(
  userId: string,
  input: FavoriteQuestionInput,
): Promise<void> {
  await upsertQuestionPool(mapFavoriteQuestionToQuestionPoolInput(input));

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
