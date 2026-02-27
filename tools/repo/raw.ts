import type { Prisma, QuestionRaw } from "@prisma/client";
import { SUBCATEGORIES } from "../../src/lib/meta/subcategories";
import type { Question, QuestionSubcategory } from "../types";
import { prisma } from "./prisma";

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

  const subjectId = getSubjectId(input.subcategory);

  await prisma.questionRaw.createMany({
    data: input.questions.map((question) => ({
      id: question.id,
      subjectId,
      subcategoryId: input.subcategory,
      prompt: question.prompt,
      difficulty: question.difficulty,
      options: question.options as unknown as Prisma.InputJsonValue,
    })),
    skipDuplicates: true,
  });
}

export async function takeNextQuestionRaw(): Promise<QuestionRaw | null> {
  return prisma.questionRaw.findFirst({
    orderBy: { id: "asc" },
  });
}

export async function deleteQuestionRawById(id: string): Promise<void> {
  await prisma.questionRaw.delete({
    where: { id },
  });
}
