import type { QuestionOption } from "../types";
import { resolveQuestionWithAI } from "./index";
import {
  deleteQuestionRawById,
  persistQuestionToCandidate,
  takeNextQuestionRaw,
} from "../repo";

export type ResolveNextRawQuestionResult =
  | { status: "empty" }
  | {
      status: "passed" | "rejected";
      questionId: string;
      resolvedCorrectOptionIndex: number;
      isCorrectOptionIndexMatch: boolean;
    };

export async function resolveNextQuestionFromRawWithAI(): Promise<ResolveNextRawQuestionResult> {
  const rawQuestion = await takeNextQuestionRaw();
  if (!rawQuestion) {
    return { status: "empty" };
  }

  const resolution = await resolveQuestionWithAI(
    {
      prompt: rawQuestion.prompt,
      options: rawQuestion.options as unknown as QuestionOption[],
    },
  );

  const resolvedCorrectOptionIndex = resolution.correctOptionIndex;
  const isCorrectOptionIndexMatch = resolvedCorrectOptionIndex === 0;
  const isPassed = isCorrectOptionIndexMatch;

  if (isPassed) {
    await persistQuestionToCandidate(rawQuestion);
  }

  await deleteQuestionRawById(rawQuestion.id);

  return {
    status: isPassed ? "passed" : "rejected",
    questionId: rawQuestion.id,
    resolvedCorrectOptionIndex,
    isCorrectOptionIndexMatch,
  };
}
