import type {
  DifficultyEnum,
  SubjectEnum,
  SubcategoryEnum,
} from "@/lib/meta";
import {
  addFavoriteQuestion,
  removeFavoriteQuestion,
} from "../api";
import type { Question } from "../types";
import { isFavoriteAuthError } from "../utils/questionGuards";

export type ToggleQuestionFavoriteInput = {
  isFavorite: boolean;
  subjectId: SubjectEnum;
  subcategoryId: SubcategoryEnum;
  difficulty: DifficultyEnum;
  question: Question;
};

export type ToggleQuestionFavoriteResult =
  | { type: "success"; isFavorite: boolean }
  | { type: "auth_required" }
  | { type: "error"; error: unknown };

export async function toggleQuestionFavorite(
  input: ToggleQuestionFavoriteInput,
): Promise<ToggleQuestionFavoriteResult> {
  try {
    if (input.isFavorite) {
      await removeFavoriteQuestion(input.question.id);
      return { type: "success", isFavorite: false };
    }

    await addFavoriteQuestion({
      subjectId: input.subjectId,
      subcategoryId: input.subcategoryId,
      difficulty: input.difficulty,
      question: input.question,
    });
    return { type: "success", isFavorite: true };
  } catch (error) {
    if (isFavoriteAuthError(error)) {
      return { type: "auth_required" };
    }

    return { type: "error", error };
  }
}
