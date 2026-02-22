export type GenerateQuestionRequest = {
  subjectId: string;
  subcategoryId: string;
};

export const QUESTION_TYPE_MULTIPLE_CHOICE = "multiple_choice" as const;

export type QuestionOption = {
  text: string;
  explanation: string;
};

export type Question = {
  id: string;
  questionType: typeof QUESTION_TYPE_MULTIPLE_CHOICE;
  prompt: string;
  difficulty: string;
  options: QuestionOption[];
  correctOptionIndexes: number[];
};

export const QUESTION_OPTION_LIMITS = {
  minOptions: 3,
  maxOptions: 4,
} as const;
