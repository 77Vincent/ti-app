import {
  SUBJECTS,
  SUBCATEGORIES,
  DIFFICULTIES,
} from "@/lib/meta";
import type { DifficultyEnum } from "@/lib/meta";

export type GenerateQuestionRequest = {
  subjectId: string;
  subcategoryId: string;
  difficulty: DifficultyEnum;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidDifficulty(value: string): value is DifficultyEnum {
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
