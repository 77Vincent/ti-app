import type { QuestionOption } from "../types";
import {
  resolveQuestionSecondPassWithAI,
  resolveQuestionWithAI,
} from "./index";
import { QUESTION_OPTION_COUNT } from "../../src/lib/config/question";
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
      isSecondPassApproved: boolean;
    };

type ResolutionCheck = {
  resolvedCorrectOptionIndexes: number[];
  isCorrectOptionIndexMatch: boolean;
  hasMultipleCorrectOptions: boolean;
  hasTechnicalIssue: boolean;
  isSecondPassApproved: boolean;
  isPassed: boolean;
};

function buildTechnicalIssueResult(): ResolutionCheck {
  return {
    resolvedCorrectOptionIndexes: [],
    isCorrectOptionIndexMatch: false,
    hasMultipleCorrectOptions: false,
    hasTechnicalIssue: true,
    isSecondPassApproved: false,
    isPassed: false,
  };
}

function normalizeText(text: string): string {
  return text
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function normalizeTextIgnoringPunctuation(text: string): string {
  return normalizeText(text)
    .replace(/[\p{P}\p{S}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function hasStaticTechnicalIssue(
  prompt: string,
  options: QuestionOption[],
): boolean {
  const normalizedPrompt = normalizeText(prompt);
  const punctuationInsensitivePrompt = normalizeTextIgnoringPunctuation(prompt);
  // Rule 1: prompt must be non-empty and options count must match the fixed contract.
  if (normalizedPrompt.length === 0 || options.length !== QUESTION_OPTION_COUNT) {
    return true;
  }

  const normalizedOptions = options.map((option) => normalizeText(option.text));
  const punctuationInsensitiveOptions = options.map((option) => (
    normalizeTextIgnoringPunctuation(option.text)
  ));
  // Rule 2: each option must be non-empty.
  if (normalizedOptions.some((text) => text.length === 0)) {
    return true;
  }

  // Rule 3: options must be unique after normalization.
  if (new Set(normalizedOptions).size !== normalizedOptions.length) {
    return true;
  }

  // Rule 4: options must stay unique even after punctuation/symbol differences are ignored.
  if (new Set(punctuationInsensitiveOptions).size !== punctuationInsensitiveOptions.length) {
    return true;
  }

  // Rule 5: no option may repeat the prompt text, including punctuation-only variants.
  return punctuationInsensitiveOptions.some((text) => text === punctuationInsensitivePrompt);
}

async function evaluateQuestion(
  prompt: string,
  options: QuestionOption[],
): Promise<ResolutionCheck> {
  if (hasStaticTechnicalIssue(prompt, options)) {
    return buildTechnicalIssueResult();
  }

  const resolution = await resolveQuestionWithAI({ prompt, options });
  const resolvedCorrectOptionIndexes = [...resolution.correctOptionIndexes]
    .sort((a, b) => a - b);
  const hasTechnicalIssue = resolution.hasTechnicalIssue;
  const hasMultipleCorrectOptions = resolvedCorrectOptionIndexes.length > 1;
  const isCorrectOptionIndexMatch =
    !hasTechnicalIssue &&
    resolvedCorrectOptionIndexes.length === 1 &&
    resolvedCorrectOptionIndexes[0] === 0;
  const isSecondPassApproved = isCorrectOptionIndexMatch
    ? await resolveQuestionSecondPassWithAI({
        prompt,
        correctOption: {
          text: options[0].text,
        },
      })
    : false;
  const isPassed = isCorrectOptionIndexMatch && isSecondPassApproved;

  return {
    resolvedCorrectOptionIndexes,
    isCorrectOptionIndexMatch,
    hasMultipleCorrectOptions,
    hasTechnicalIssue,
    isSecondPassApproved,
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
    isSecondPassApproved: result.isSecondPassApproved,
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
    isSecondPassApproved: result.isSecondPassApproved,
  };
}
