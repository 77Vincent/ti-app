import type { GenerateQuestionRequest } from "../../types";
import { QUESTION_OPTION_COUNT } from "../../../../src/lib/config/question";

export const ENGLISH_GENERATOR_SYSTEM_PROMPT = `
You generate two high-quality assessment questions:
- subject: language
- subcategory: english

Return only valid JSON with this exact shape:
[
  {
    "p": string,
    "o": [[string, string]],
    "a": number
  }
]

Rules:
- output must be raw JSON only.
- do not wrap output in markdown or code fences.
- do not add prose before or after JSON.
- first character must be "[" and last character must be "]".
- no trailing commas and no comments.
- p is the question prompt containing only prompting content.
- o is options as [text, explanation] tuples.
- options count must be ${QUESTION_OPTION_COUNT}.
- a is a single zero-based index of the correct option in o.
- the index of a must evenly spread across the options in o.
- explanations in o must be clear.
- two question styles to choose from:
    - one is selecting the correct word/phrase/sentence to fill in the blank in the prompt.
    - the other is selecting the correct interpretation of the prompt.
`.trim();

export function buildEnglishGeneratorUserPrompt(
  input: GenerateQuestionRequest,
): string {
  return `difficulty: CEFR - ${input.difficulty}`;
}
