import {
  requestAddFavoriteQuestion,
  requestReadFavoriteQuestionState,
  requestRemoveFavoriteQuestion,
  type FavoriteQuestionStateResponse,
} from "@/lib/favorite/api";
import { parseHttpErrorMessage } from "@/lib/http/error";
import { QuestionRunnerApiError } from "./error";

export async function addFavoriteQuestion(questionId: string): Promise<void> {
  const response = await requestAddFavoriteQuestion(questionId);

  if (!response.ok) {
    throw new QuestionRunnerApiError(
      await parseHttpErrorMessage(response, "Failed to favorite question."),
      response.status,
    );
  }
}

export async function removeFavoriteQuestion(questionId: string): Promise<void> {
  const response = await requestRemoveFavoriteQuestion(questionId);

  if (!response.ok) {
    throw new QuestionRunnerApiError(
      await parseHttpErrorMessage(response, "Failed to unfavorite question."),
      response.status,
    );
  }
}

export async function readFavoriteQuestionState(
  questionId: string,
): Promise<boolean> {
  const response = await requestReadFavoriteQuestionState(questionId);

  if (!response.ok) {
    throw new QuestionRunnerApiError(
      await parseHttpErrorMessage(response, "Failed to load favorite state."),
      response.status,
    );
  }

  const payload = (await response.json()) as FavoriteQuestionStateResponse;

  if (typeof payload.isFavorite !== "boolean") {
    throw new QuestionRunnerApiError(
      payload.error ?? "Failed to load favorite state.",
      response.status,
    );
  }

  return payload.isFavorite;
}
