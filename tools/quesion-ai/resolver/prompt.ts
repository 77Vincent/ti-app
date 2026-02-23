import type { QuestionResolverInput } from "../types";
import { QUESTION_OPTION_COUNT } from "../../../src/lib/config/question";

export const RESOLVER_SYSTEM_PROMPT = `
You resolve one high-quality assessment question.

Return only valid JSON with this exact shape:
{
  "a": number
}

Rules:
- a is a single zero-based index of the best correct option.
- a must be between 0 and ${QUESTION_OPTION_COUNT - 1}.
- output only JSON, no markdown, no extra prose.
`.trim();

export function buildResolverUserPrompt(input: QuestionResolverInput): string {
  const options = input.options
    .map((option, index) => `[${index}] ${option.text}`)
    .join("\n");

  return `question: ${input.prompt}\noptions:\n${options}`;
}
