import {
  SUBJECTS,
  SUBCATEGORIES,
  DIFFICULTIES,
} from "@/lib/meta";
import type { DifficultyLevel } from "@/lib/meta";

export type GenerateQuestionRequest = {
  subjectId: string;
  subcategoryId: string;
  difficulty: DifficultyLevel;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidDifficulty(value: string): value is DifficultyLevel {
  return DIFFICULTIES.some((difficulty) => difficulty.id === value);
}

function isValidSubject(value: string): boolean {
  return SUBJECTS.some((subject) => subject.id === value);
}

function isValidSubcategoryForSubject(
  subcategoryId: string,
  subjectId: string,
): boolean {
  return SUBCATEGORIES.some(
    (subcategory) =>
      subcategory.id === subcategoryId && subcategory.subjectId === subjectId,
  );
}

export function parseGenerateQuestionRequest(
  body: unknown,
): GenerateQuestionRequest | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const { subjectId, subcategoryId, difficulty } = body as Record<string, unknown>;

  if (
    !isNonEmptyString(subjectId) ||
    !isValidSubject(subjectId) ||
    !isNonEmptyString(subcategoryId) ||
    !isValidSubcategoryForSubject(subcategoryId, subjectId) ||
    !isNonEmptyString(difficulty) ||
    !isValidDifficulty(difficulty)
  ) {
    return null;
  }

  return {
    subjectId,
    subcategoryId,
    difficulty,
  };
}
