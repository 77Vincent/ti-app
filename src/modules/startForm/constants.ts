import type { DifficultyLevel } from "@/lib/meta";

export const INFINITE_QUESTION_COUNT = 9999;
export const INFINITE_TIME_LIMIT_MINUTES = 9999;

export type QuestionCountOption = number;
export type TimeLimitOption = number;

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

export const TIME_LIMIT_OPTIONS: Array<{
  value: TimeLimitOption;
  label: string;
}> = [
  { value: 5, label: "5min" },
  { value: 15, label: "15min" },
  { value: 30, label: "30min" },
  { value: 45, label: "45min" },
  { value: 60, label: "1h" },
  { value: 90, label: "1.5h" },
  { value: INFINITE_TIME_LIMIT_MINUTES, label: "Infinite" },
];

export const START_FORM_STEP_TITLES = {
  subject: "Subject of your test",
  subcategory: "Subcategory of your test",
  difficulty: "Difficulty",
  questionCount: "Number of questions",
  timeLimit: "Time limit",
} as const;

export type StartFormStep = keyof typeof START_FORM_STEP_TITLES;

export type StartFormSelectionState = {
  selectedSubjectId: string | null;
  selectedSubcategoryId: string | null;
  selectedDifficulty: DifficultyLevel | null;
  selectedQuestionCount: QuestionCountOption | null;
};
