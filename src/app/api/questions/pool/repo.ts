import { prisma } from "@/lib/prisma";
import type {
  DifficultyEnum,
  GoalEnum,
  QuestionType,
  SubjectEnum,
  SubcategoryEnum,
} from "@/lib/meta";
import type { QuestionOptionId } from "@/lib/validation/question";

type QuestionPoolOption = {
  id: QuestionOptionId;
  text: string;
  explanation: string;
};

export type QuestionPoolUpsertInput = {
  id: string;
  subjectId: SubjectEnum;
  subcategoryId: SubcategoryEnum;
  difficulty: DifficultyEnum;
  goal: GoalEnum;
  questionType: QuestionType;
  prompt: string;
  options: readonly QuestionPoolOption[];
  correctOptionIds: readonly QuestionOptionId[];
};

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
      goal: input.goal,
      questionType: input.questionType,
      prompt: input.prompt,
      options: input.options,
      correctOptionIds: input.correctOptionIds,
    },
    update: {
      subjectId: input.subjectId,
      subcategoryId: input.subcategoryId,
      difficulty: input.difficulty,
      goal: input.goal,
      questionType: input.questionType,
      prompt: input.prompt,
      options: input.options,
      correctOptionIds: input.correctOptionIds,
    },
  });
}
