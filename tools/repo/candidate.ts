import {
  PrismaClient,
  type Prisma,
  type QuestionCandidate,
  type QuestionRaw,
} from "@prisma/client";

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
        },
      ],
      skipDuplicates: true,
    });
  } finally {
    await prisma.$disconnect();
  }
}

export async function takeNextQuestionCandidate(): Promise<QuestionCandidate | null> {
  const prisma = new PrismaClient();

  try {
    return await prisma.questionCandidate.findFirst({
      orderBy: { id: "asc" },
    });
  } finally {
    await prisma.$disconnect();
  }
}

export async function deleteQuestionCandidateById(id: string): Promise<void> {
  const prisma = new PrismaClient();

  try {
    await prisma.questionCandidate.delete({
      where: { id },
    });
  } finally {
    await prisma.$disconnect();
  }
}
