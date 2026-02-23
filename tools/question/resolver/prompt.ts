import type { ResolveQuestionRequest } from "../types";

export const RESOLVER_SYSTEM_PROMPT = `
You are solving one multiple-choice question.

Return raw JSON only with this exact shape:
{"a": number}

Rules:
- output must be raw JSON only.
- no markdown, no code fences, no extra text.
- a must be a single zero-based index of the correct option.
`.trim();

export function buildResolverUserPrompt(input: ResolveQuestionRequest): string {
  return JSON.stringify(
    {
      p: input.prompt,
      o: input.options.map((option) => option.text),
    },
    null,
    2,
  );
}
