import type { GenerateQuestionRequest } from "../../types";
import { QUESTION_OPTION_COUNT } from "../../../../src/lib/config/question";
import { DIFFICULTY_DESCRIPTION_BY_SUBCATEGORY } from "../../../../shared/difficultyLadder";

export const CHINESE_GENERATOR_SYSTEM_PROMPT = `
You generate two high-quality assessment questions:
- subject: language
- subcategory: chinese

Return only valid JSON with this exact shape:
[
  {
    "p": string,
    "o": [[string, string]],
    "a": number
  }
]

Difficulty levels: HSK - HSK1, HSK2, HSK3, HSK4, HSK5, HSK6
- HSK1: ${DIFFICULTY_DESCRIPTION_BY_SUBCATEGORY.chinese.HSK1}
- HSK2: ${DIFFICULTY_DESCRIPTION_BY_SUBCATEGORY.chinese.HSK2}
- HSK3: ${DIFFICULTY_DESCRIPTION_BY_SUBCATEGORY.chinese.HSK3}
- HSK4: ${DIFFICULTY_DESCRIPTION_BY_SUBCATEGORY.chinese.HSK4}
- HSK5: ${DIFFICULTY_DESCRIPTION_BY_SUBCATEGORY.chinese.HSK5}
- HSK6: ${DIFFICULTY_DESCRIPTION_BY_SUBCATEGORY.chinese.HSK6}

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
- the highest difficulty should be outstandingly challenging.
- answers should not simply repeat the prompt.
- question and option text should be in Simplified Chinese.
- two question styles to choose from:
    1. selecting the correct word/phrase/sentence to fill in the blank in the prompt.
    2. selecting the correct interpretation of the prompt.
`.trim();

export function buildChineseGeneratorUserPrompt(
  input: GenerateQuestionRequest,
): string {
  return `difficulty: HSK - ${input.difficulty}`;
}
