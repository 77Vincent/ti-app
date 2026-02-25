import { PrismaClient, type Prisma } from "@prisma/client";
import { SUBCATEGORIES } from "../../../src/lib/meta/subcategories";
import type { Question, QuestionSubcategory } from "../types";

type PersistQuestionsToRawInput = {
  subcategory: QuestionSubcategory;
  questions: Question[];
};

function getSubjectId(subcategory: QuestionSubcategory): string {
  const matchedSubcategory = SUBCATEGORIES.find((item) => item.id === subcategory);
  if (!matchedSubcategory) {
    throw new Error(`Unknown subcategory: ${subcategory}`);
  }

  return matchedSubcategory.subjectId;
}

export async function persistQuestionsToRaw(
  input: PersistQuestionsToRawInput,
): Promise<void> {
  if (input.questions.length === 0) {
    return;
  }

  const prisma = new PrismaClient();
  const subjectId = getSubjectId(input.subcategory);

  try {
    for (const question of input.questions) {
      await prisma.questionRaw.upsert({
        where: { id: question.id },
        create: {
          id: question.id,
          subjectId,
          subcategoryId: input.subcategory,
          prompt: question.prompt,
          difficulty: question.difficulty,
          options: question.options as unknown as Prisma.InputJsonValue,
          correctOptionIndexes:
            question.correctOptionIndexes as unknown as Prisma.InputJsonValue,
        },
        update: {
          subjectId,
          subcategoryId: input.subcategory,
          prompt: question.prompt,
          difficulty: question.difficulty,
          options: question.options as unknown as Prisma.InputJsonValue,
          correctOptionIndexes:
            question.correctOptionIndexes as unknown as Prisma.InputJsonValue,
        },
      });
    }
  } finally {
    await prisma.$disconnect();
  }
}
