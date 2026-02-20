import type {
  SubjectEnum,
  SubcategoryEnum,
} from "@/lib/meta";
import type { DifficultyEnum } from "@/lib/meta";

export const START_FORM_STEP_TITLES = {
  subject: "Subject",
  subcategory: "Subcategory",
} as const;

export type StartFormStep = keyof typeof START_FORM_STEP_TITLES;

export const DEFAULT_TEST_DIFFICULTY: DifficultyEnum = "beginner";

export type StartFormSelectionState = {
  selectedSubjectId: SubjectEnum | null;
  selectedSubcategoryId: SubcategoryEnum | null;
};
