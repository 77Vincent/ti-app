import type { QuestionOption } from "../types";
import { resolveQuestionWithAI } from "./index";
import {
  deleteQuestionRawById,
  persistQuestionRawToPool,
  takeNextQuestionRaw,
} from "../repo";

export type ResolveNextRawQuestionResult =
  | { status: "empty" }
  | {
      status: "passed" | "rejected";
      questionId: string;
      resolvedCorrectOptionIndexes: number[];
      isCorrectOptionIndexMatch: boolean;
      hasMultipleCorrectOptions: boolean;
      hasTechnicalIssue: boolean;
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

  const resolvedCorrectOptionIndexes = [...resolution.correctOptionIndexes]
    .sort((a, b) => a - b);
  const hasTechnicalIssue = resolution.hasTechnicalIssue;
  const hasMultipleCorrectOptions = resolvedCorrectOptionIndexes.length > 1;
  const isCorrectOptionIndexMatch =
    !hasTechnicalIssue &&
    resolvedCorrectOptionIndexes.length === 1 &&
    resolvedCorrectOptionIndexes[0] === 0;
  const isPassed = !hasTechnicalIssue && isCorrectOptionIndexMatch;

  if (isPassed) {
    await persistQuestionRawToPool(rawQuestion);
  }

  await deleteQuestionRawById(rawQuestion.id);

  return {
    status: isPassed ? "passed" : "rejected",
    questionId: rawQuestion.id,
    resolvedCorrectOptionIndexes,
    isCorrectOptionIndexMatch,
    hasMultipleCorrectOptions,
    hasTechnicalIssue,
  };
}
