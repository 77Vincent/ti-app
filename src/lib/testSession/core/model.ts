import type { Question, QuestionOptionId } from "@/lib/question/validation";

export type LocalTestSessionSnapshot = {
  sessionId: string;
  questions: LocalTestSessionQuestionEntry[];
  currentQuestionIndex: number;
};

export type LocalTestSessionQuestionEntry = {
  question: Question;
  selectedOptionIds: QuestionOptionId[];
  hasSubmitted: boolean;
};

export type LocalTestSessionQuestionState = {
  question: Question;
  selectedOptionIds: QuestionOptionId[];
  hasSubmitted: boolean;
  currentQuestionIndex: number;
};

export type LocalTestSessionAccuracy = {
  submittedCount: number;
  correctCount: number;
};
