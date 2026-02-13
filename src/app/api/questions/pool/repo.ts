import { prisma } from "@/lib/prisma";
import type {
  DifficultyEnum,
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
import type { QuestionParam } from "@/lib/validation/testSession";

type QuestionPoolOption = {
  id: QuestionOptionId;
  text: string;
  explanation: string;
};

type QuestionPoolReadRow = {
  id: string;
  questionType: string;
  prompt: string;
  options: unknown;
  correctOptionIds: unknown;
};

export type QuestionPoolUpsertInput = {
  id: string;
  subjectId: SubjectEnum;
  subcategoryId: SubcategoryEnum;
  difficulty: DifficultyEnum;
  questionType: QuestionType;
  prompt: string;
  options: readonly QuestionPoolOption[];
  correctOptionIds: readonly QuestionOptionId[];
};

export async function countQuestionPoolMatches(
  input: QuestionParam,
): Promise<number> {
  return prisma.questionPool.count({
    where: {
      subjectId: input.subjectId,
      subcategoryId: input.subcategoryId,
      difficulty: input.difficulty,
    },
  });
}

export async function readQuestionFromPool(
  input: QuestionParam,
): Promise<Question | null> {
  const where = {
    subjectId: input.subjectId,
    subcategoryId: input.subcategoryId,
    difficulty: input.difficulty,
  } as const;

  const randomThreshold = Math.random();

  const row = await prisma.questionPool.findFirst({
    where: {
      ...where,
      randomKey: {
        gte: randomThreshold,
      },
    },
    orderBy: {
      randomKey: "asc",
    },
    select: {
      id: true,
      questionType: true,
      prompt: true,
      options: true,
      correctOptionIds: true,
    },
  });

  const selectedRow =
    row ??
    (await prisma.questionPool.findFirst({
      where,
      orderBy: {
        randomKey: "asc",
      },
      select: {
        id: true,
        questionType: true,
        prompt: true,
        options: true,
        correctOptionIds: true,
      },
    }));

  return parseQuestionPoolRow(selectedRow);
}

function parseQuestionPoolRow(row: QuestionPoolReadRow | null): Question | null {
  if (!row || !isQuestionType(row.questionType)) {
    return null;
  }

  const options = parseQuestionOptions(row.options, {
    minOptions: 2,
    maxOptions: 6,
  });

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
      questionType: input.questionType,
      prompt: input.prompt,
      options: input.options,
      correctOptionIds: input.correctOptionIds,
    },
    update: {
      subjectId: input.subjectId,
      subcategoryId: input.subcategoryId,
      difficulty: input.difficulty,
      questionType: input.questionType,
      prompt: input.prompt,
      options: input.options,
      correctOptionIds: input.correctOptionIds,
    },
  });
}
