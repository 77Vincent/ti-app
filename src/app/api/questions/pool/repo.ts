import { prisma } from "@/lib/prisma";
import type {
  QuestionType,
  SubjectEnum,
  SubcategoryEnum,
} from "@/lib/meta";
import type {
  Question,
  QuestionOptionIndex,
} from "@/lib/question/model";
import type { QuestionParam } from "@/lib/testSession/validation";

type QuestionPoolOption = {
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
  questionType: QuestionType;
  prompt: string;
  options: readonly QuestionPoolOption[];
  correctOptionIndexes: readonly QuestionOptionIndex[];
};

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
    questionType: row.questionType as QuestionType,
    prompt: row.prompt,
    options: row.options as Question["options"],
    correctOptionIndexes: row.correctOptionIds as QuestionOptionIndex[],
  };
}

export async function upsertQuestionPool(
  input: QuestionPoolUpsertInput,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.questionPool.findUnique({
      where: {
        id: input.id,
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      return;
    }

    const context = await tx.questionPoolContext.upsert({
      where: {
        subjectId_subcategoryId: {
          subjectId: input.subjectId,
          subcategoryId: input.subcategoryId,
        },
      },
      create: {
        subjectId: input.subjectId,
        subcategoryId: input.subcategoryId,
        questionCount: 1,
      },
      update: {
        questionCount: {
          increment: 1,
        },
      },
      select: {
        questionCount: true,
      },
    });

    await tx.questionPool.create({
      data: {
        id: input.id,
        subjectId: input.subjectId,
        subcategoryId: input.subcategoryId,
        slot: context.questionCount,
        questionType: input.questionType,
        prompt: input.prompt,
        options: input.options,
        correctOptionIds: input.correctOptionIndexes,
      },
    });
  });
}
