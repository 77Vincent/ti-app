import {
  DIFFICULTIES,
  SUBJECTS,
  SUBCATEGORIES,
} from "@/lib/meta";
import type { DifficultyEnum } from "@/lib/meta";

export const TEST_SESSION_STORAGE_KEY = "ti-app:test-session";

export type TestRunParams = {
  subjectId: string;
  subcategoryId: string;
  difficulty: DifficultyEnum;
};

type StoredTestSession = TestRunParams;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function parseStoredTestSession(rawSession: string | null): TestRunParams | null {
  if (!rawSession) {
    return null;
  }

  try {
    const value = JSON.parse(rawSession) as Partial<StoredTestSession>;

    const subjectId = value.subjectId;
    const subcategoryId = value.subcategoryId;
    const difficulty = value.difficulty;

    if (
      !isNonEmptyString(subjectId) ||
      !isNonEmptyString(subcategoryId) ||
      !isNonEmptyString(difficulty)
    ) {
      return null;
    }

    const isValidDifficulty = DIFFICULTIES.some(
      (item) => item.id === difficulty,
    );
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
  } catch {
    return null;
  }
}

export function clearStoredTestSession(): void {
  sessionStorage.removeItem(TEST_SESSION_STORAGE_KEY);
}
