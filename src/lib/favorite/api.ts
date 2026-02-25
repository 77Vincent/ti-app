import { API_PATHS } from "@/lib/config/paths";
import type { SubcategoryEnum, SubjectEnum } from "@/lib/meta";
import type { QuestionPreview } from "@/lib/question/model";

export type FavoriteQuestionStateResponse = {
  isFavorite?: boolean;
  error?: string;
};

export type FavoriteQuestionsResponse = {
  questions: QuestionPreview[];
};

export function requestAddFavoriteQuestion(questionId: string): Promise<Response> {
  return fetch(API_PATHS.QUESTIONS_FAVORITE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questionId }),
  });
}

export function requestRemoveFavoriteQuestion(
  questionId: string,
): Promise<Response> {
  return fetch(API_PATHS.QUESTIONS_FAVORITE, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questionId }),
  });
}

export function requestReadFavoriteQuestionState(
  questionId: string,
): Promise<Response> {
  return fetch(
    `${API_PATHS.QUESTIONS_FAVORITE}?questionId=${encodeURIComponent(questionId)}`,
    {
      cache: "no-store",
      method: "GET",
    },
  );
}

export function requestReadFavoriteQuestions(
  subjectId: SubjectEnum,
  subcategoryId?: SubcategoryEnum,
): Promise<Response> {
  const searchParams = new URLSearchParams({ subjectId });

  if (subcategoryId) {
    searchParams.set("subcategoryId", subcategoryId);
  }

  return fetch(`${API_PATHS.QUESTIONS_FAVORITE}?${searchParams.toString()}`, {
    method: "GET",
    cache: "no-store",
  });
}
