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
} from "@/lib/question/model";
import type { QuestionParam } from "@/lib/testSession/validation";

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

export async function readRandomQuestionFromPool(
  input: QuestionParam,
): Promise<Question | null> {
  const pivot = Math.random();

  const row =
    (await prisma.questionPool.findFirst({
      where: {
        subjectId: input.subjectId,
        subcategoryId: input.subcategoryId,
        difficulty: input.difficulty,
        randomKey: {
          gte: pivot,
        },
      },
      orderBy: {
        randomKey: "asc",
      },
      select: QUESTION_POOL_READ_SELECT,
    })) ??
    (await prisma.questionPool.findFirst({
      where: {
        subjectId: input.subjectId,
        subcategoryId: input.subcategoryId,
        difficulty: input.difficulty,
      },
      orderBy: {
        randomKey: "asc",
      },
      select: QUESTION_POOL_READ_SELECT,
    }));

  return row ? toQuestion(row as QuestionPoolReadRow) : null;
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
