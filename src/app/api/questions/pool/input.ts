import type { QuestionPoolUpsertInput } from "./repo";

type QuestionPoolFavoriteSource = Omit<QuestionPoolUpsertInput, "id"> & {
  questionId: string;
};

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
