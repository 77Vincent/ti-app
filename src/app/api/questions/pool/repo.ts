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

const QUESTION_POOL_READ_SELECT = {
  id: true,
  questionType: true,
  prompt: true,
  options: true,
  correctOptionIds: true,
} as const;

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
): Promise<[Question, Question] | null> {
  const where = {
    subjectId: input.subjectId,
    subcategoryId: input.subcategoryId,
    difficulty: input.difficulty,
  } as const;

  const randomThreshold = Math.random();

  const rowsAfterThreshold = await prisma.questionPool.findMany({
    where: {
      ...where,
      randomKey: {
        gte: randomThreshold,
      },
    },
    orderBy: { randomKey: "asc" },
    take: 2,
    select: QUESTION_POOL_READ_SELECT,
  });

  const remainingCount = 2 - rowsAfterThreshold.length;
  const rows =
    remainingCount <= 0
      ? rowsAfterThreshold
      : [
          ...rowsAfterThreshold,
          ...(await prisma.questionPool.findMany({
            where: {
              ...where,
              id: {
                notIn: rowsAfterThreshold.map((row) => row.id),
              },
            },
            orderBy: { randomKey: "asc" },
            take: remainingCount,
            select: QUESTION_POOL_READ_SELECT,
          })),
        ];

  if (rows.length !== 2) {
    return null;
  }

  const [firstRow, secondRow] = rows as [QuestionPoolReadRow, QuestionPoolReadRow];

  return [toQuestion(firstRow), toQuestion(secondRow)];
}

function toQuestion(row: QuestionPoolReadRow): Question {
  return {
    id: row.id,
    questionType: row.questionType as QuestionType,
    prompt: row.prompt,
    options: row.options as Question["options"],
    correctOptionIds: row.correctOptionIds as QuestionOptionId[],
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
