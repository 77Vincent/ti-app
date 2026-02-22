import { API_PATHS } from "@/lib/config/paths";
import { parseHttpErrorMessage } from "@/lib/http/error";
import { QuestionRunnerApiError } from "./error";

type FavoriteQuestionStateResponse = {
  isFavorite?: boolean;
  error?: string;
};

export async function addFavoriteQuestion(questionId: string): Promise<void> {
  const response = await fetch(API_PATHS.QUESTIONS_FAVORITE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      questionId,
    }),
  });

  if (!response.ok) {
    throw new QuestionRunnerApiError(
      await parseHttpErrorMessage(response, "Failed to favorite question."),
      response.status,
    );
  }
}

export async function removeFavoriteQuestion(questionId: string): Promise<void> {
  const response = await fetch(API_PATHS.QUESTIONS_FAVORITE, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questionId }),
  });

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
  const response = await fetch(
    `${API_PATHS.QUESTIONS_FAVORITE}?questionId=${encodeURIComponent(questionId)}`,
    {
      cache: "no-store",
      method: "GET",
    },
  );

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
