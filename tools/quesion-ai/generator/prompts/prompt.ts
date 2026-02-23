import type { GenerateQuestionRequest } from "../../types";
import {
  ENGLISH_GENERATOR_SYSTEM_PROMPT,
  buildEnglishGeneratorUserPrompt,
} from "./english";

export function buildGeneratorSystemPrompt(
  input: GenerateQuestionRequest,
): string {
  void input;
  return ENGLISH_GENERATOR_SYSTEM_PROMPT;
}

export function buildGeneratorUserPrompt(input: GenerateQuestionRequest): string {
  return buildEnglishGeneratorUserPrompt(input);
}
