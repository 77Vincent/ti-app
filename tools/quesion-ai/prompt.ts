import type { GenerateQuestionRequest } from "./types";
import {
  ENGLISH_QUESTION_SYSTEM_PROMPT,
  buildEnglishQuestionUserPrompt,
} from "./prompts/english";

export function buildQuestionSystemPrompt(
  input: GenerateQuestionRequest,
): string {
  void input;
  return ENGLISH_QUESTION_SYSTEM_PROMPT;
}

export function buildQuestionUserPrompt(input: GenerateQuestionRequest): string {
  return buildEnglishQuestionUserPrompt(input);
}
