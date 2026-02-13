import type { Question } from "@/lib/validation/question";
import type { QuestionParam } from "@/lib/validation/testSession";
import type { QuestionPoolUpsertInput } from "./repo";

type QuestionPoolFavoriteSource = Omit<QuestionPoolUpsertInput, "id"> & {
  questionId: string;
};

export function mapGeneratedQuestionToQuestionPoolInput(
  params: QuestionParam,
  question: Question,
): QuestionPoolUpsertInput {
  return {
    id: question.id,
    subjectId: params.subjectId,
    subcategoryId: params.subcategoryId,
    difficulty: params.difficulty,
    questionType: question.questionType,
    prompt: question.prompt,
    options: question.options,
    correctOptionIds: question.correctOptionIds,
  };
}

export function mapFavoriteQuestionToQuestionPoolInput(
  input: QuestionPoolFavoriteSource,
): QuestionPoolUpsertInput {
  return {
    id: input.questionId,
    subjectId: input.subjectId,
    subcategoryId: input.subcategoryId,
    difficulty: input.difficulty,
    questionType: input.questionType,
    prompt: input.prompt,
    options: input.options,
    correctOptionIds: input.correctOptionIds,
  };
}
