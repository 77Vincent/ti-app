import type { DifficultyEnum, GoalEnum } from "@/lib/meta";

export const START_FORM_STEP_TITLES = {
  subject: "Subject of your test",
  subcategory: "Subcategory of your test",
  difficulty: "Difficulty",
  goal: "Goal of your test",
} as const;

export type StartFormStep = keyof typeof START_FORM_STEP_TITLES;

export type StartFormSelectionState = {
  selectedSubjectId: string | null;
  selectedSubcategoryId: string | null;
  selectedDifficulty: DifficultyEnum | null;
  selectedGoal: GoalEnum | null;
};
