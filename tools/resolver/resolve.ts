import type { QuestionOption } from "../types";
import { resolveQuestionWithAI } from "./index";
import {
  deleteQuestionPoolById,
  deleteQuestionRawById,
  persistQuestionRawToPool,
  takeNextQuestionPool,
  takeNextQuestionRaw,
} from "../repo";

export type ResolveNextQuestionResult =
  | { status: "empty" }
  | {
      status: "passed" | "rejected";
      questionId: string;
      resolvedCorrectOptionIndexes: number[];
      isCorrectOptionIndexMatch: boolean;
      hasMultipleCorrectOptions: boolean;
      hasTechnicalIssue: boolean;
    };

type ResolutionCheck = {
  resolvedCorrectOptionIndexes: number[];
  isCorrectOptionIndexMatch: boolean;
  hasMultipleCorrectOptions: boolean;
  hasTechnicalIssue: boolean;
  isPassed: boolean;
};

async function evaluateQuestion(
  prompt: string,
  options: QuestionOption[],
): Promise<ResolutionCheck> {
  const resolution = await resolveQuestionWithAI({ prompt, options });
  const resolvedCorrectOptionIndexes = [...resolution.correctOptionIndexes]
    .sort((a, b) => a - b);
  const hasTechnicalIssue = resolution.hasTechnicalIssue;
  const hasMultipleCorrectOptions = resolvedCorrectOptionIndexes.length > 1;
  const isCorrectOptionIndexMatch =
    !hasTechnicalIssue &&
    resolvedCorrectOptionIndexes.length === 1 &&
    resolvedCorrectOptionIndexes[0] === 0;
  const isPassed = !hasTechnicalIssue && isCorrectOptionIndexMatch;

  return {
    resolvedCorrectOptionIndexes,
    isCorrectOptionIndexMatch,
    hasMultipleCorrectOptions,
    hasTechnicalIssue,
    isPassed,
  };
}

export async function resolveNextQuestionFromRawWithAI(): Promise<ResolveNextQuestionResult> {
  const rawQuestion = await takeNextQuestionRaw();
  if (!rawQuestion) {
    return { status: "empty" };
  }

  const result = await evaluateQuestion(
    rawQuestion.prompt,
    rawQuestion.options as unknown as QuestionOption[],
  );

  if (result.isPassed) {
    await persistQuestionRawToPool(rawQuestion);
  } else {
    console.log(rawQuestion);
  }

  await deleteQuestionRawById(rawQuestion.id);

  return {
    status: result.isPassed ? "passed" : "rejected",
    questionId: rawQuestion.id,
    resolvedCorrectOptionIndexes: result.resolvedCorrectOptionIndexes,
    isCorrectOptionIndexMatch: result.isCorrectOptionIndexMatch,
    hasMultipleCorrectOptions: result.hasMultipleCorrectOptions,
    hasTechnicalIssue: result.hasTechnicalIssue,
  };
}

export async function resolveNextQuestionFromPoolWithAI(): Promise<ResolveNextQuestionResult> {
  const poolQuestion = await takeNextQuestionPool();
  if (!poolQuestion) {
    return { status: "empty" };
  }

  const result = await evaluateQuestion(
    poolQuestion.prompt,
    poolQuestion.options as unknown as QuestionOption[],
  );

  if (!result.isPassed) {
    console.log(poolQuestion);
    await deleteQuestionPoolById(poolQuestion.id);
  }

  return {
    status: result.isPassed ? "passed" : "rejected",
    questionId: poolQuestion.id,
    resolvedCorrectOptionIndexes: result.resolvedCorrectOptionIndexes,
    isCorrectOptionIndexMatch: result.isCorrectOptionIndexMatch,
    hasMultipleCorrectOptions: result.hasMultipleCorrectOptions,
    hasTechnicalIssue: result.hasTechnicalIssue,
  };
}
