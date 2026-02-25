import type {
  AnalyzeQuestionRequest,
  AnalyzeQuestionResult,
} from "../types";
import { requestDeepSeekAnalyzerContent } from "./client";

export async function analyzeQuestionWithAI(
  input: AnalyzeQuestionRequest,
): Promise<AnalyzeQuestionResult> {
  const content = await requestDeepSeekAnalyzerContent(input);

  let payload: unknown;
  try {
    payload = JSON.parse(content);
  } catch {
    throw new Error("Analyzer response was not valid JSON.");
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Analyzer response shape is invalid.");
  }

  const ok = (payload as Record<string, unknown>).ok;
  if (ok !== 0 && ok !== 1) {
    throw new Error("Analyzer response ok is invalid.");
  }

  return {
    isAccepted: ok === 1,
  };
}
