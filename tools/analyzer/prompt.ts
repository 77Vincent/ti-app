import type { AnalyzeQuestionRequest } from "../types";

export function buildAnalyzerSystemPrompt(): string {
  return `
You are reviewing one multiple-choice question candidate for publication.
You check the quality of the question based on the following rules.

Return raw JSON only with this exact shape:
{"ok": 0 | 1}

Rules:
- output must be raw JSON only.
- no markdown, no code fences, no extra text.
- ok must be 1 only if all checks pass, else 0.
- checks:
  1) the question matches the requested subcategory.
  2) the question and options are logically coherent and unambigous.
  3) exactly one best answer.
  4) option index 0 is the correct choice.
`.trim();
}

export function buildAnalyzerUserPrompt(input: AnalyzeQuestionRequest): string {
  return JSON.stringify(
    {
      subcategory: input.subcategory,
      p: input.prompt,
      o: input.options.map((option) => [option.text, option.explanation]),
    },
    null,
    2,
  );
}
