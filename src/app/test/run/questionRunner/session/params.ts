import {
  DIFFICULTIES,
  SUBJECTS,
  SUBCATEGORIES,
} from "@/lib/meta";
import type { DifficultyEnum } from "@/lib/meta";
import { isNonEmptyString } from "@/lib/string";

export type TestRunParams = {
  subjectId: string;
  subcategoryId: string;
  difficulty: DifficultyEnum;
};

export function parseTestRunParams(value: unknown): TestRunParams | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Partial<TestRunParams>;
  const subjectId = raw.subjectId;
  const subcategoryId = raw.subcategoryId;
  const difficulty = raw.difficulty;

  if (
    !isNonEmptyString(subjectId) ||
    !isNonEmptyString(subcategoryId) ||
    !isNonEmptyString(difficulty)
  ) {
    return null;
  }

  const isValidDifficulty = DIFFICULTIES.some((item) => item.id === difficulty);
  const isValidSubject = SUBJECTS.some((item) => item.id === subjectId);
  const isValidSubcategory = SUBCATEGORIES.some(
    (item) => item.id === subcategoryId && item.subjectId === subjectId,
  );

  if (!isValidDifficulty || !isValidSubject || !isValidSubcategory) {
    return null;
  }

  return {
    subjectId,
    subcategoryId,
    difficulty: difficulty as DifficultyEnum,
  };
}
