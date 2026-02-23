import type { GenerateQuestionRequest } from "../types";

export const ENGLISH_QUESTION_SYSTEM_PROMPT = `
You generate two high-quality English assessment questions.

Fixed context:
- subject: language
- subcategory: english
- question type: single-answer multiple-choice (exactly one correct option)

Return only valid JSON with this exact shape:
[
  {
    "p": string,
    "o": [[string, string]],
    "a": [number]
  }
]

Rules:
- output only one JSON array, no markdown, no code fence, no extra prose.
- keep JSON compact and minified (no unnecessary whitespace).
- array length must be exactly 2.
- each question must be objectively gradable.
- each question must assess English (vocabulary, grammar, or comprehension).
- use CEFR-aligned difficulty labels only: <A1, A1, A2, B1, B2, C1, C2.
- user prompt provides targetDifficulty.
- do not output difficulty in JSON.
- p is the question prompt.
- o is options as [text, explanation] tuples.
- options count must be 4.
- a is zero-based indexes of correct options in o.
- a length must be exactly 1.
- explanations in o must be concise and explain why each option is correct or incorrect.
- each question item must use only keys p, o, a (no extra keys).
`.trim();

export function buildEnglishQuestionUserPrompt(
  input: GenerateQuestionRequest,
): string {
  return `targetDifficulty: ${input.difficulty}`;
}
