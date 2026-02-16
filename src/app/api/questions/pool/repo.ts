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

type TestSessionQuestionPoolReadRow = {
  id: string;
  question: QuestionPoolReadRow;
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

export async function consumeQuestionFromTestSessionPool(
  sessionId: string,
  input: QuestionParam,
): Promise<Question | null> {
  return prisma.$transaction(async (tx) => {
    const row = await tx.testSessionQuestionPool.findFirst({
      where: {
        sessionId,
        question: {
          subjectId: input.subjectId,
          subcategoryId: input.subcategoryId,
          difficulty: input.difficulty,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        question: {
          select: QUESTION_POOL_READ_SELECT,
        },
      },
    });

    if (!row) {
      return null;
    }

    await tx.testSessionQuestionPool.delete({
      where: {
        id: row.id,
      },
    });

    return toQuestion((row as TestSessionQuestionPoolReadRow).question);
  });
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

export async function upsertTestSessionQuestionPoolLink(
  sessionId: string,
  questionId: string,
): Promise<void> {
  await prisma.testSessionQuestionPool.upsert({
    where: {
      sessionId_questionId: {
        sessionId,
        questionId,
      },
    },
    create: {
      sessionId,
      questionId,
    },
    update: {},
  });
}
