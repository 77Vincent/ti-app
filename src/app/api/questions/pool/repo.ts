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
  correctOptionIds: unknown;
};

const QUESTION_POOL_READ_SELECT = {
  id: true,
  prompt: true,
  difficulty: true,
  options: true,
  correctOptionIds: true,
} as const;

export async function readRandomQuestionFromPool(
  input: QuestionParam,
): Promise<Question | null> {
  const context = await prisma.questionPoolContext.findUnique({
    where: {
      subjectId_subcategoryId: {
        subjectId: input.subjectId,
        subcategoryId: input.subcategoryId,
      },
    },
    select: {
      questionCount: true,
    },
  });

  if (!context || context.questionCount < 1) {
    return null;
  }

  const randomSlot = Math.floor(Math.random() * context.questionCount) + 1;

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

  if (!row) {
    throw new Error(
      "Question pool context is inconsistent with slot records.",
    );
  }

  return toQuestion(row);
}

function toQuestion(row: QuestionPoolReadRow): Question {
  return {
    id: row.id,
    prompt: row.prompt,
    difficulty: row.difficulty,
    options: row.options as Question["options"],
    correctOptionIndexes: row.correctOptionIds as QuestionOptionIndex[],
  };
}
