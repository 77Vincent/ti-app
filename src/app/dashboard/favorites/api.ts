import { API_PATHS } from "@/lib/config/paths";
import type { SubcategoryEnum, SubjectEnum } from "@/lib/meta";

export type FavoriteQuestionPreview = {
  id: string;
  prompt: string;
  difficulty: string;
  correctOptionIndexes: number[];
  options: Array<{
    text: string;
    explanation: string;
  }>;
};

type FavoriteQuestionsResponse = {
  questions: FavoriteQuestionPreview[];
};

export async function readFavoriteQuestions(
  subjectId: SubjectEnum,
  subcategoryId?: SubcategoryEnum,
): Promise<FavoriteQuestionPreview[]> {
  const searchParams = new URLSearchParams({
    subjectId,
  });

  if (subcategoryId) {
    searchParams.set("subcategoryId", subcategoryId);
  }

  const response = await fetch(
    `${API_PATHS.QUESTIONS_FAVORITE}?${searchParams.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );
  if (!response.ok) {
    throw new Error("Failed to load favorite questions.");
  }

  const payload = (await response.json()) as FavoriteQuestionsResponse;
  return payload.questions;
}

export async function removeFavoriteQuestion(questionId: string): Promise<void> {
  const response = await fetch(API_PATHS.QUESTIONS_FAVORITE, {
    method: "DELETE",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ questionId }),
  });
  if (!response.ok) {
    throw new Error("Failed to remove favorite question.");
  }
}
