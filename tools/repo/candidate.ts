import { PrismaClient, type Prisma, type QuestionRaw } from "@prisma/client";

export async function persistQuestionToCandidate(
  question: QuestionRaw,
): Promise<void> {
  const prisma = new PrismaClient();

  try {
    await prisma.questionCandidate.createMany({
      data: [
        {
          id: question.id,
          subjectId: question.subjectId,
          subcategoryId: question.subcategoryId,
          prompt: question.prompt,
          difficulty: question.difficulty,
          options: question.options as unknown as Prisma.InputJsonValue,
          correctOptionIndexes:
            question.correctOptionIndexes as unknown as Prisma.InputJsonValue,
        },
      ],
      skipDuplicates: true,
    });
  } finally {
    await prisma.$disconnect();
  }
}
