import type {
  ResolveQuestionRequest,
  ResolveQuestionResult,
} from "../types";
import { QUESTION_OPTION_COUNT } from "../../../src/lib/config/question";
import { requestDeepSeekResolverContent } from "./client";

export async function resolveQuestionWithAI(
  input: ResolveQuestionRequest,
  difficultyFramework: string,
  difficultyLadder: readonly string[],
  difficultyDescriptions: Record<string, string>,
): Promise<ResolveQuestionResult> {
  const content = await requestDeepSeekResolverContent(
    input,
    difficultyFramework,
    difficultyLadder,
    difficultyDescriptions,
  );

  let payload: unknown;
  try {
    payload = JSON.parse(content);
  } catch {
    throw new Error("Resolver response was not valid JSON.");
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Resolver response shape is invalid.");
  }

  const answerIndex = (payload as Record<string, unknown>).a;
  if (
    typeof answerIndex !== "number" ||
    !Number.isInteger(answerIndex) ||
    answerIndex < 0 ||
    answerIndex >= QUESTION_OPTION_COUNT
  ) {
    throw new Error("Resolver response answer index is invalid.");
  }

  const resolvedDifficulty = (payload as Record<string, unknown>).d;
  if (
    typeof resolvedDifficulty !== "string" ||
    !difficultyLadder.includes(resolvedDifficulty)
  ) {
    throw new Error("Resolver response difficulty is invalid.");
  }

  return {
    correctOptionIndex: answerIndex,
    difficulty: resolvedDifficulty,
  };
}
