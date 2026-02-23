import type { GenerateQuestionRequest } from "../types";

export const ENGLISH_QUESTION_SYSTEM_PROMPT = `
You generate two high-quality assessment questions:
- subject: language
- subcategory: english

Return only valid JSON with this exact shape:
[
  {
    "p": string,
    "o": [[string, string]],
    "a": [number]
  }
]

Rules:
- p is the question prompt containing only prompting content.
- o is options as [text, explanation] tuples.
- options count must be 4.
- a is a single zero-based index of the correct option in o.
- explanations in o must be clear.
`.trim();

export function buildEnglishQuestionUserPrompt(
  input: GenerateQuestionRequest,
): string {
  return `difficulty: CEFR - ${input.difficulty}`;
}
