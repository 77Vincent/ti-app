import {
  DIFFICULTIES,
  GOALS,
  SUBJECTS,
  SUBCATEGORIES,
} from "@/lib/meta";
import type { DifficultyEnum, GoalEnum, SubjectEnum } from "@/lib/meta";
import { isNonEmptyString } from "@/lib/string";

export type TestParam = {
  subjectId: SubjectEnum;
  subcategoryId: string;
  difficulty: DifficultyEnum;
  goal: GoalEnum;
};

export type TestSession = TestParam & {
  id: string;
  correctCount: number;
  submittedCount: number;
  startedAtMs: number;
};

export function parseTestParam(value: unknown): TestParam | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Partial<TestParam>;
  const subjectId = raw.subjectId;
  const subcategoryId = raw.subcategoryId;
  const difficulty = raw.difficulty;
  const goal = raw.goal;

  if (
    !isNonEmptyString(subjectId) ||
    !isNonEmptyString(subcategoryId) ||
    !isNonEmptyString(difficulty) ||
    !isNonEmptyString(goal)
  ) {
    return null;
  }

  const isValidDifficulty = DIFFICULTIES.some((item) => item.id === difficulty);
  const isValidGoal = GOALS.some((item) => item.id === goal);
  const isValidSubject = SUBJECTS.some((item) => item.id === subjectId);
  const isValidSubcategory = SUBCATEGORIES.some(
    (item) => item.id === subcategoryId && item.subjectId === subjectId,
  );

  if (!isValidDifficulty || !isValidGoal || !isValidSubject || !isValidSubcategory) {
    return null;
  }

  return {
    subjectId: subjectId as SubjectEnum,
    subcategoryId,
    difficulty: difficulty as DifficultyEnum,
    goal: goal as GoalEnum,
  };
}

export function parseTestSession(value: unknown): TestSession | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const params = parseTestParam(value);
  if (!params) {
    return null;
  }

  const id = (value as { id?: unknown }).id;
  if (!isNonEmptyString(id)) {
    return null;
  }

  const startedAtMs = (value as { startedAtMs?: unknown }).startedAtMs;
  if (
    typeof startedAtMs !== "number" ||
    !Number.isFinite(startedAtMs) ||
    startedAtMs <= 0
  ) {
    return null;
  }

  const correctCount = (value as { correctCount?: unknown }).correctCount;
  if (
    typeof correctCount !== "number" ||
    !Number.isFinite(correctCount) ||
    correctCount < 0
  ) {
    return null;
  }

  const submittedCount = (value as { submittedCount?: unknown }).submittedCount;
  if (
    typeof submittedCount !== "number" ||
    !Number.isFinite(submittedCount) ||
    submittedCount < 0
  ) {
    return null;
  }

  return {
    ...params,
    id,
    correctCount: Math.floor(correctCount),
    submittedCount: Math.floor(submittedCount),
    startedAtMs: Math.floor(startedAtMs),
  };
}
