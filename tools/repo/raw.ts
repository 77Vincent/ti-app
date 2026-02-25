import { PrismaClient, type Prisma, type QuestionRaw } from "@prisma/client";
import { SUBCATEGORIES } from "../../src/lib/meta/subcategories";
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
    await prisma.questionRaw.createMany({
      data: input.questions.map((question) => ({
        id: question.id,
        subjectId,
        subcategoryId: input.subcategory,
        prompt: question.prompt,
        difficulty: question.difficulty,
        options: question.options as unknown as Prisma.InputJsonValue,
        correctOptionIndexes:
          question.correctOptionIndexes as unknown as Prisma.InputJsonValue,
      })),
      skipDuplicates: true,
    });
  } finally {
    await prisma.$disconnect();
  }
}

export async function takeNextQuestionRaw(): Promise<QuestionRaw | null> {
  const prisma = new PrismaClient();

  try {
    return await prisma.questionRaw.findFirst({
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
  } finally {
    await prisma.$disconnect();
  }
}

export async function deleteQuestionRawById(id: string): Promise<void> {
  const prisma = new PrismaClient();

  try {
    await prisma.questionRaw.delete({
      where: { id },
    });
  } finally {
    await prisma.$disconnect();
  }
}
