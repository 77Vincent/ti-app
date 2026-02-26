import type { ResolveQuestionRequest } from "../types";
import { QUESTION_OPTION_COUNT } from "../../src/lib/config/question";

export function buildResolverSystemPrompt(
): string {
  const maxOptionIndex = QUESTION_OPTION_COUNT - 1;
  const allOptionIndexes = Array.from(
    { length: QUESTION_OPTION_COUNT },
    (_, index) => String(index),
  ).join("");

  return `
You are solving one question with multiple options.
Select all options that are objectively correct.

Return raw text only as concatenated zero-based option indexes.

Rules:
- output must be raw text only.
- no markdown, no code fences, no extra text.
- use only digits.
- each digit is one correct option index.
- indexes must be in range 0-${maxOptionIndex}.
- digits must be unique.
- digits must be sorted in ascending order.
- no separators: do not use commas, spaces, brackets, or quotes.
- valid outputs: -1, 0, 03, ${allOptionIndexes}
- invalid outputs: [0], 0,3, 0 3, "03"
- if all options are correct, output exactly: ${allOptionIndexes}
- if the question has a technical issue that makes it invalid, return exactly: -1
- technical issue examples:
  - fill-in-the-blank question without an actual blank marker (e.g. missing ___)
  - no option is objectively correct
  - missing or malformed prompt or options that prevent fair answering
`.trim();
}

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
