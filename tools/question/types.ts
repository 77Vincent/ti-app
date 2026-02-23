import type { QuestionPool } from "@prisma/client";

export type QuestionDifficulty = QuestionPool["difficulty"];

export type GenerateQuestionRequest = {
  difficulty: QuestionDifficulty;
};

export type QuestionOption = {
  text: string;
  explanation: string;
};

export type Question = {
  id: QuestionPool["id"];
  prompt: QuestionPool["prompt"];
  difficulty: QuestionDifficulty;
  options: QuestionOption[];
  correctOptionIndexes: number[];
};
