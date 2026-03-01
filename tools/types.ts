import type { QuestionPool } from "@prisma/client";
import type { SubcategoryEnum } from "../src/lib/meta/subcategories";

export type QuestionDifficulty = QuestionPool["difficulty"];
export type QuestionSubcategory = SubcategoryEnum;

export type GenerateQuestionRequest = {
  subcategory: QuestionSubcategory;
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

export type ResolveQuestionRequest = Pick<Question, "prompt" | "options">;

export type ResolveQuestionResult = {
  correctOptionIndexes: number[];
  hasTechnicalIssue: boolean;
};

export type ResolveQuestionSecondPassRequest = {
  prompt: Question["prompt"];
  correctOption: QuestionOption;
};
