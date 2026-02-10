import type { DifficultyLevel } from "@/lib/meta";

export const INFINITE_QUESTION_COUNT = 9999;

export type QuestionCountOption = number;

export const QUESTION_COUNT_OPTIONS: Array<{
  value: QuestionCountOption;
  label: string;
}> = [
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 15, label: "15" },
  { value: 20, label: "20" },
  { value: 30, label: "30" },
  { value: 40, label: "40" },
  { value: 50, label: "50" },
  { value: INFINITE_QUESTION_COUNT, label: "Infinite" },
];

export const START_FORM_STEP_TITLES = {
  subject: "Choose the subject of your test",
  subcategory: "Choose the subcategory",
  difficulty: "Choose the difficulty",
  questionCount: "Choose the number of questions",
} as const;

export type StartFormStep = keyof typeof START_FORM_STEP_TITLES;

export type StartFormSelectionState = {
  selectedSubjectId: string | null;
  selectedSubcategoryId: string | null;
  selectedDifficulty: DifficultyLevel | null;
};
