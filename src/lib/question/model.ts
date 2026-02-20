import type { QuestionType } from "@/lib/meta";

export type QuestionOptionId = "A" | "B" | "C" | "D";

export type QuestionOption = {
  id: QuestionOptionId;
  text: string;
  explanation: string;
};

export type Question = {
  id: string;
  prompt: string;
  questionType: QuestionType;
  options: QuestionOption[];
  correctOptionIds: QuestionOptionId[];
};

export const QUESTION_OPTION_IDS: QuestionOptionId[] = [
  "A",
  "B",
  "C",
  "D",
];
