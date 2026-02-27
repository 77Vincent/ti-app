import {
  type Prisma,
  QuestionPool,
  QuestionRaw,
} from "@prisma/client";
import { prisma } from "./prisma";

export async function persistQuestionRawToPool(
  question: QuestionRaw,
): Promise<void> {
  await prisma.questionPool.createMany({
    data: [
      {
        id: question.id,
        subjectId: question.subjectId,
        subcategoryId: question.subcategoryId,
        prompt: question.prompt,
        difficulty: question.difficulty,
        options: question.options as unknown as Prisma.InputJsonValue,
        correctOptionIndexes: [0] as unknown as Prisma.InputJsonValue,
      },
    ],
    skipDuplicates: true,
  });
}

export async function takeNextQuestionPool(): Promise<QuestionPool | null> {
  return prisma.questionPool.findFirst({
    orderBy: { id: "asc" },
  });
}

export async function deleteQuestionPoolById(id: string): Promise<void> {
  await prisma.questionPool.delete({
    where: { id },
  });
}
