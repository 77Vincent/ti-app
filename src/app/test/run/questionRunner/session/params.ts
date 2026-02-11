import {
  DIFFICULTIES,
  GOALS,
  SUBJECTS,
  SUBCATEGORIES,
} from "@/lib/meta";
import type { DifficultyEnum, GoalEnum, SubjectEnum } from "@/lib/meta";
import { isNonEmptyString } from "@/lib/string";

export type TestRunParams = {
  subjectId: SubjectEnum;
  subcategoryId: string;
  difficulty: DifficultyEnum;
  goal: GoalEnum;
};

export function parseTestRunParams(value: unknown): TestRunParams | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Partial<TestRunParams>;
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
