import type { GenerateQuestionRequest } from "../../types";
import { QUESTION_OPTION_COUNT } from "../../../../src/lib/config/question";
import { DIFFICULTY_DESCRIPTION_BY_SUBCATEGORY } from "../../../../shared/difficultyLadder"

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

Difficulty levels: CEFR - A1, A2, B1, B2, C1, C2
- A1: ${DIFFICULTY_DESCRIPTION_BY_SUBCATEGORY.english.A1}
- A2: ${DIFFICULTY_DESCRIPTION_BY_SUBCATEGORY.english.A2}
- B1: ${DIFFICULTY_DESCRIPTION_BY_SUBCATEGORY.english.B1}
- B2: ${DIFFICULTY_DESCRIPTION_BY_SUBCATEGORY.english.B2}
- C1: ${DIFFICULTY_DESCRIPTION_BY_SUBCATEGORY.english.C1}
- C2: ${DIFFICULTY_DESCRIPTION_BY_SUBCATEGORY.english.C2}

Rules:
- output must be raw JSON only.
- length of the outer array must be 2.
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
- in general, the higher the difficulty, the longer and richer context the prompt should have.
- the highest difficulty should be outstandingly challenging
- answers should not simply repeat the prompt
- two question styles to choose from:
    1. selecting the correct word/phrase/sentence to fill in the blank in the prompt.
    2. selecting the correct interpretation of the prompt.
`.trim();

export function buildEnglishGeneratorUserPrompt(
  input: GenerateQuestionRequest,
): string {
  return `difficulty: CEFR - ${input.difficulty}`;
}
