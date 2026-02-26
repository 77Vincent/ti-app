import { QuestionRunnerApiError } from "../api";

export function isFavoriteAuthError(error: unknown): boolean {
  return error instanceof QuestionRunnerApiError && error.status === 401;
}

export function isActiveFavoriteMutation(
  activeQuestionId: string | null,
  targetQuestionId: string,
): boolean {
  return activeQuestionId === targetQuestionId;
}
