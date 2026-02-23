import type { QuestionResolverInput } from "../../types";
import {
  RESOLVER_SYSTEM_PROMPT,
  buildResolverUserPrompt as buildGeneralResolverUserPrompt,
} from "./general";

export function buildResolverSystemPrompt(): string {
  return RESOLVER_SYSTEM_PROMPT;
}

export function buildResolverUserPrompt(
  input: QuestionResolverInput,
): string {
  return buildGeneralResolverUserPrompt(input);
}
