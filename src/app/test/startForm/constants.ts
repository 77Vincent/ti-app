import type {
  DifficultyEnum,
  GoalEnum,
  SubjectEnum,
  SubcategoryEnum,
} from "@/lib/meta";

export const START_FORM_STEP_TITLES = {
  subject: "Subject of your test",
  subcategory: "Subcategory of your test",
  difficulty: "Difficulty",
  goal: "Goal of your test",
} as const;

export type StartFormStep = keyof typeof START_FORM_STEP_TITLES;

export type StartFormSelectionState = {
  selectedSubjectId: SubjectEnum | null;
  selectedSubcategoryId: SubcategoryEnum | null;
  selectedDifficulty: DifficultyEnum | null;
  selectedGoal: GoalEnum | null;
};
