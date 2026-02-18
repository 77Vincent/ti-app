import type {
  DifficultyEnum,
  SubjectEnum,
  SubcategoryEnum,
} from "@/lib/meta";

export const START_FORM_STEP_TITLES = {
  subject: "Subject",
  subcategory: "Subcategory",
  difficulty: "Difficulty",
} as const;

export type StartFormStep = keyof typeof START_FORM_STEP_TITLES;

export type StartFormSelectionState = {
  selectedSubjectId: SubjectEnum | null;
  selectedSubcategoryId: SubcategoryEnum | null;
  selectedDifficulty: DifficultyEnum | null;
};
