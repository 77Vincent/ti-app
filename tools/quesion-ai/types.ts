export type GenerateQuestionRequest = {
  subjectId: string;
  subcategoryId: string;
};

export const QUESTION_TYPE_MULTIPLE_CHOICE = "multiple_choice" as const;

export type QuestionOptionId = "A" | "B" | "C" | "D";

export type QuestionOption = {
  id: QuestionOptionId;
  text: string;
  explanation: string;
};

export type Question = {
  id: string;
  questionType: typeof QUESTION_TYPE_MULTIPLE_CHOICE;
  prompt: string;
  options: QuestionOption[];
  correctOptionIds: QuestionOptionId[];
};

export const QUESTION_OPTION_IDS: QuestionOptionId[] = ["A", "B", "C", "D"];

export const QUESTION_OPTION_LIMITS = {
  minOptions: 3,
  maxOptions: 4,
} as const;
