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

const MAX_RANDOM_SLOT_ATTEMPTS = 3;

export async function readRandomQuestionFromPool(
  input: QuestionParam,
): Promise<Question | null> {
  const where = {
    subjectId: input.subjectId,
    subcategoryId: input.subcategoryId,
  } as const;

  const bounds = await prisma.questionPool.aggregate({
    where,
    _min: { slot: true },
    _max: { slot: true },
  });

  const minSlot = bounds._min.slot;
  const maxSlot = bounds._max.slot;
  if (minSlot === null || maxSlot === null) {
    return null;
  }

  for (let attempt = 0; attempt < MAX_RANDOM_SLOT_ATTEMPTS; attempt += 1) {
    const randomSlot = getRandomIntInclusive(minSlot, maxSlot);
    const row = await prisma.questionPool.findUnique({
      where: {
        subjectId_subcategoryId_slot: {
          subjectId: input.subjectId,
          subcategoryId: input.subcategoryId,
          slot: randomSlot,
        },
      },
      select: QUESTION_POOL_READ_SELECT,
    });

    if (row) {
      return toQuestion(row);
    }
  }

  const row = await prisma.questionPool.findFirst({
    where,
    orderBy: {
      slot: "asc",
    },
    select: QUESTION_POOL_READ_SELECT,
  });

  if (!row) {
    return null;
  }

  return toQuestion(row);
}

function getRandomIntInclusive(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
