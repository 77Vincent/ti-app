import {
  DIFFICULTY_OPTIONS,
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
  return DIFFICULTY_OPTIONS.some((difficulty) => difficulty.id === value);
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
    !isNonEmptyString(subcategoryId) ||
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
