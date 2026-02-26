import type {
  ResolveQuestionRequest,
  ResolveQuestionResult,
} from "../types";
import { QUESTION_OPTION_COUNT } from "../../src/lib/config/question";
import { requestDeepSeekResolverContent } from "./client";

export async function resolveQuestionWithAI(
  input: ResolveQuestionRequest,
): Promise<ResolveQuestionResult> {
  const content = await requestDeepSeekResolverContent(input);
  const rawOutput = content.trim();
  if (rawOutput.length === 0) {
    throw new Error("Resolver response answer indexes are invalid.");
  }

  if (rawOutput === "-1") {
    return {
      correctOptionIndexes: [],
      hasTechnicalIssue: true,
    };
  }

  const answerIndexes = rawOutput.split("").map((char) => {
    if (!/^\d$/.test(char)) {
      throw new Error("Resolver response answer indexes are invalid.");
    }

    return Number.parseInt(char, 10);
  });

  if (answerIndexes.some((index) => index < 0 || index >= QUESTION_OPTION_COUNT)) {
    throw new Error("Resolver response answer indexes are invalid.");
  }

  const uniqueAnswerIndexes = new Set(answerIndexes);
  if (uniqueAnswerIndexes.size !== answerIndexes.length) {
    throw new Error("Resolver response answer indexes are invalid.");
  }

  if (answerIndexes.some((index, position) => (
    position > 0 && answerIndexes[position - 1] >= index
  ))) {
    throw new Error("Resolver response answer indexes are invalid.");
  }

  return {
    correctOptionIndexes: answerIndexes,
    hasTechnicalIssue: false,
  };
}
