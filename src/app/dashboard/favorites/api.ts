import {
  requestReadFavoriteQuestions,
  requestRemoveFavoriteQuestion,
  type FavoriteQuestionsResponse,
} from "@/lib/favorite/api";
import type { SubcategoryEnum, SubjectEnum } from "@/lib/meta";
import type { QuestionPreview } from "@/lib/question/model";

export type FavoriteQuestionPreview = QuestionPreview;

export async function readFavoriteQuestions(
  subjectId: SubjectEnum,
  subcategoryId?: SubcategoryEnum,
): Promise<FavoriteQuestionPreview[]> {
  const response = await requestReadFavoriteQuestions(subjectId, subcategoryId);
  if (!response.ok) {
    throw new Error("Failed to load favorite questions.");
  }

  const payload = (await response.json()) as FavoriteQuestionsResponse;
  return payload.questions;
}

export async function removeFavoriteQuestion(questionId: string): Promise<void> {
  const response = await requestRemoveFavoriteQuestion(questionId);
  if (!response.ok) {
    throw new Error("Failed to remove favorite question.");
  }
}
