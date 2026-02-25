import { QUESTION_OPTION_COUNT } from "../../../../src/lib/config/question";
import {
  DIFFICULTY_LADDER_BY_SUBCATEGORY,
} from "../../../../shared/difficultyLadder";

export const GENERATOR_COMMON_OUTPUT_SHAPE_BLOCK = `
Return only valid JSON with this exact shape:
[
  {
    "p": string,
    "o": [[string, string]],
    "a": number
  }
]
`.trim();

export const GENERATOR_COMMON_RULES_BLOCK = `
Rules:
- output must be raw JSON only.
- length of the outer array must be 2.
- do not wrap output in markdown or code fences.
- do not add prose before or after JSON.
- first character must be "[" and last character must be "]".
- no trailing commas and no comments.
- p is the question prompt containing only prompting content.
- p and every o[i][0] must be non-empty strings.
- o is options as [text, explanation] tuples.
- options count must be ${QUESTION_OPTION_COUNT}.
- option text values in o must be unique within the same question.
- a is a single zero-based index of the correct option in o.
- a must be an integer within [0, ${QUESTION_OPTION_COUNT - 1}].
- the index of a must evenly spread across the options in o.
- explanations in o should be clear and consistent with correctness.
- the correct option explanation should clearly state why it is correct.
- each incorrect option explanation should clearly state why it is incorrect.
- for pronunciation-only beginner questions, explanations may be empty strings.
- in general, the higher the difficulty, the longer and richer context the prompt should have.
- the highest difficulty should be outstandingly challenging.
- answers should not simply repeat the prompt.
- there should be no ambiguiy, the correct answer should logically make sense, and must be clearly correct.
- low difficulty questions should not be lengthy.
`.trim();

export const GENERATOR_LANGUAGE_QUESTION_STYLE_BLOCK = `
Question styles:
1. selecting the correct word/phrase/sentence to fill in the blank in the prompt. No need to explicitly tell or hint the test taker to fill in the blank, showing the blank is sufficient.
2. selecting the correct interpretation of the prompt.
`.trim();

export function buildDifficultyTargetPrompt(
  subcategory: keyof typeof DIFFICULTY_LADDER_BY_SUBCATEGORY,
  difficulty: string,
): string {
  const profile = DIFFICULTY_LADDER_BY_SUBCATEGORY[subcategory];
  return `difficulty: ${profile.framework} - ${difficulty}`;
}
