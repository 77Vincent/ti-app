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
- the question matches the requested subcategory.
- the question and options are logically coherent and unambigous.
- option index 0 is the correct choice.
- exactly one best answer is defensible; distractors are clearly less correct.
- No harmful, offensive, or unsafe content.
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
