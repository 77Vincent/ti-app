import type { QuestionPool } from "@prisma/client";

export type GenerateQuestionRequest = {
  subjectId: string;
  subcategoryId: string;
};

export type QuestionOption = {
  text: string;
  explanation: string;
};

export type QuestionDifficulty = QuestionPool["difficulty"];

export type Question = {
  id: QuestionPool["id"];
  prompt: QuestionPool["prompt"];
  difficulty: QuestionDifficulty;
  options: QuestionOption[];
  correctOptionIndexes: number[];
};

export const QUESTION_OPTION_LIMITS = {
  minOptions: 3,
  maxOptions: 4,
} as const;
