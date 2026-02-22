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
  } as const;

  const total = await prisma.questionPool.count({ where });
  if (total < 1) {
    return null;
  }

  const randomOffset = Math.floor(Math.random() * total);

  const [row] = await prisma.questionPool.findMany({
    where,
    orderBy: {
      slot: "asc",
    },
    skip: randomOffset,
    take: 1,
    select: QUESTION_POOL_READ_SELECT,
  });

  if (!row) {
    throw new Error(
      "Question pool random selection returned no rows.",
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
    correctOptionIndexes: row.correctOptionIndexes as QuestionOptionIndex[],
  };
}
