import { prisma } from "@/lib/prisma";
import type {
  DifficultyEnum,
  GoalEnum,
  QuestionType,
  SubjectEnum,
  SubcategoryEnum,
} from "@/lib/meta";
import type {
  Question,
  QuestionOptionId,
} from "@/lib/validation/question";
import {
  hasValidCorrectOptionCount,
  isQuestionType,
  parseCorrectOptionIds,
  parseQuestionOptions,
} from "@/lib/validation/question";
import type { TestParam } from "@/lib/validation/testSession";

type QuestionPoolOption = {
  id: QuestionOptionId;
  text: string;
  explanation: string;
};

export type QuestionPoolUpsertInput = {
  id: string;
  subjectId: SubjectEnum;
  subcategoryId: SubcategoryEnum;
  difficulty: DifficultyEnum;
  goal: GoalEnum;
  questionType: QuestionType;
  prompt: string;
  options: readonly QuestionPoolOption[];
  correctOptionIds: readonly QuestionOptionId[];
};

export async function readQuestionFromPool(
  input: TestParam,
): Promise<Question | null> {
  const row = await prisma.questionPool.findFirst({
    where: {
      subjectId: input.subjectId,
      subcategoryId: input.subcategoryId,
      difficulty: input.difficulty,
      goal: input.goal,
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      questionType: true,
      prompt: true,
      options: true,
      correctOptionIds: true,
    },
  });

  if (!row || !isQuestionType(row.questionType)) {
    return null;
  }

  const options = parseQuestionOptions(row.options, { minOptions: 2, maxOptions: 6 });

  if (!options) {
    return null;
  }

  const correctOptionIds = parseCorrectOptionIds(row.correctOptionIds, options);

  if (
    !correctOptionIds ||
    !hasValidCorrectOptionCount(row.questionType, correctOptionIds)
  ) {
    return null;
  }

  return {
    id: row.id,
    questionType: row.questionType,
    prompt: row.prompt,
    options,
    correctOptionIds,
  };
}

export async function upsertQuestionPool(
  input: QuestionPoolUpsertInput,
): Promise<void> {
  await prisma.questionPool.upsert({
    where: {
      id: input.id,
    },
    create: {
      id: input.id,
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
}
