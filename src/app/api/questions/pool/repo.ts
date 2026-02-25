import { prisma } from "@/lib/prisma";
import type {
  Question,
  QuestionOptionIndex,
} from "@/lib/question/model";
import type { QuestionParam } from "@/lib/testSession/validation";

type QuestionPoolReadRow = {
  id: string;
  prompt: string;
  difficulty: string;
  options: unknown;
  correctOptionIndexes: unknown;
};

const QUESTION_POOL_READ_SELECT = {
  id: true,
  prompt: true,
  difficulty: true,
  options: true,
  correctOptionIndexes: true,
} as const;

export async function readRandomQuestionFromPool(
  input: QuestionParam,
): Promise<Question | null> {
  const where = {
    subjectId: input.subjectId,
    subcategoryId: input.subcategoryId,
    difficulty: input.difficulty,
  };

  const total = await prisma.questionPool.count({ where });
  if (total === 0) {
    return null;
  }

  const randomOffset = getRandomOffset(total);

  const row = await prisma.questionPool.findFirst({
    where,
    orderBy: {
      id: "asc",
    },
    skip: randomOffset,
    select: QUESTION_POOL_READ_SELECT,
  });

  if (!row) {
    return null;
  }

  return toQuestion(row);
}

export async function readQuestionFromPoolById(
  input: QuestionParam,
  questionId: string,
): Promise<Question | null> {
  const row = await prisma.questionPool.findFirst({
    where: {
      id: questionId,
      subjectId: input.subjectId,
      subcategoryId: input.subcategoryId,
      difficulty: input.difficulty,
    },
    select: QUESTION_POOL_READ_SELECT,
  });

  if (!row) {
    return null;
  }

  return toQuestion(row);
}

function getRandomOffset(total: number): number {
  return Math.floor(Math.random() * total);
}

function toQuestion(row: QuestionPoolReadRow): Question {
  return {
    id: row.id,
    prompt: row.prompt,
    difficulty: row.difficulty,
    options: row.options as Question["options"],
    correctOptionIndexes: row.correctOptionIndexes as QuestionOptionIndex[],
  };
}
