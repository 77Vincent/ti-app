import {
  PrismaClient,
  type Prisma,
  type QuestionCandidate,
} from "@prisma/client";

export async function persistQuestionCandidateToPool(
  question: QuestionCandidate,
): Promise<void> {
  const prisma = new PrismaClient();

  try {
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
  } finally {
    await prisma.$disconnect();
  }
}
