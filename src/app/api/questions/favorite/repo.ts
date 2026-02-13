import { prisma } from "@/lib/prisma";
import type {
  DifficultyEnum,
  GoalEnum,
  QuestionType,
  SubjectEnum,
  SubcategoryEnum,
} from "@/lib/meta";

type FavoriteOption = {
  id: string;
  text: string;
  explanation: string;
};

export type FavoriteQuestionInput = {
  questionId: string;
  subjectId: SubjectEnum;
  subcategoryId: SubcategoryEnum;
  difficulty: DifficultyEnum;
  goal: GoalEnum;
  questionType: QuestionType;
  prompt: string;
  options: readonly FavoriteOption[];
  correctOptionIds: readonly string[];
};

export async function upsertFavoriteQuestion(
  userId: string,
  input: FavoriteQuestionInput,
): Promise<void> {
  await prisma.questionPool.upsert({
    where: {
      id: input.questionId,
    },
    create: {
      id: input.questionId,
      subjectId: input.subjectId,
      subcategoryId: input.subcategoryId,
      difficulty: input.difficulty,
      goal: input.goal,
      questionType: input.questionType,
      prompt: input.prompt,
      options: input.options,
      correctOptionIds: input.correctOptionIds,
    },
    update: {
      subjectId: input.subjectId,
      subcategoryId: input.subcategoryId,
      difficulty: input.difficulty,
      goal: input.goal,
      questionType: input.questionType,
      prompt: input.prompt,
      options: input.options,
      correctOptionIds: input.correctOptionIds,
    },
  });

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
