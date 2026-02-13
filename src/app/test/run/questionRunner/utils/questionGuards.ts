import { QuestionRunnerApiError } from "../api";

type CanSubmitQuestionInput = {
  hasQuestion: boolean;
  hasSubmitted: boolean;
  selectedOptionCount: number;
  isSubmitting: boolean;
};

export function canSubmitQuestion({
  hasQuestion,
  hasSubmitted,
  selectedOptionCount,
  isSubmitting,
}: CanSubmitQuestionInput): boolean {
  if (!hasQuestion || isSubmitting) {
    return false;
  }

  if (!hasSubmitted && selectedOptionCount === 0) {
    return false;
  }

  return true;
}

export function isFavoriteAuthError(error: unknown): boolean {
  return error instanceof QuestionRunnerApiError && error.status === 401;
}

export function isActiveFavoriteMutation(
  activeQuestionId: string | null,
  targetQuestionId: string,
): boolean {
  return activeQuestionId === targetQuestionId;
}
