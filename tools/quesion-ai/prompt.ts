import type { GenerateQuestionRequest } from "./types";

export const AI_QUESTION_SYSTEM_PROMPT = `
You generate two high-quality assessment questions.

Return only valid JSON with this exact shape:
[
  {
    "p": string,
    "d": string,
    "o": [[string, string]],
    "a": [number]
  }
]

Rules:
- output only one JSON array, no markdown, no code fence, no extra prose.
- keep JSON compact and minified (no unnecessary whitespace).
- array length must be exactly 2.
- each question must be objectively gradable.
- prioritize clarity, realism and factual correctness.
- use markdown/LaTeX only when needed.
- if using inline math, use $...$ delimiters (do not use \\(...\\)).
- write valid LaTeX commands with a leading backslash (example: \\mathbb{R}^n).
- p is the question prompt.
- d is the difficulty label for the question (example: A1, A2, B1, B2, C1, C2).
- o is options as [text, explanation] tuples.
- options count must be 4.
- a is zero-based indexes of correct options in o.
- a length must be exactly 1.
- explanations in o must be concise and explain why each option is correct or incorrect.
- each question item must use only keys p, d, o, a (no extra keys).
`.trim();

export function buildQuestionUserPrompt(input: GenerateQuestionRequest): string {
  return `
Context:
- subject: ${input.subjectId}
- subcategory: ${input.subcategoryId}
`.trim();
}
