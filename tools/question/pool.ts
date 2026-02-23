import { PrismaClient, type Prisma } from "@prisma/client";
import { SUBCATEGORIES } from "../../src/lib/meta/subcategories";
import type { Question, QuestionSubcategory } from "./types";

type PersistQuestionsInput = {
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

export async function persistQuestionsToPool(
  input: PersistQuestionsInput,
): Promise<void> {
  if (input.questions.length === 0) {
    return;
  }

  const prisma = new PrismaClient();
  const subjectId = getSubjectId(input.subcategory);

  try {
    const questionIds = input.questions.map((question) => question.id);
    const existingRows = await prisma.questionPool.findMany({
      where: { id: { in: questionIds } },
      select: { id: true },
    });
    const existingIds = new Set(existingRows.map((row) => row.id));

    for (const question of input.questions) {
      const data = {
        subjectId,
        subcategoryId: input.subcategory,
        prompt: question.prompt,
        difficulty: question.difficulty,
        options: question.options as unknown as Prisma.InputJsonValue,
        correctOptionIndexes:
          question.correctOptionIndexes as unknown as Prisma.InputJsonValue,
      };

      if (existingIds.has(question.id)) {
        await prisma.questionPool.update({
          where: { id: question.id },
          data,
        });
        continue;
      }

      await prisma.questionPool.create({
        data: {
          id: question.id,
          ...data,
        },
      });
    }
  } finally {
    await prisma.$disconnect();
  }
}
