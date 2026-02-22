import type { QuestionType } from "@/lib/meta";

export type QuestionOptionIndex = number;

export type QuestionOption = {
  text: string;
  explanation: string;
};

export type Question = {
  id: string;
  prompt: string;
  difficulty: string;
  questionType: QuestionType;
  options: QuestionOption[];
  correctOptionIndexes: QuestionOptionIndex[];
};
