import { QUESTION_OPTION_COUNT } from "../../../src/lib/config/question";
import {
  DIFFICULTY_LADDER_BY_SUBCATEGORY,
} from "../../../shared/difficultyLadder";

export const GENERATOR_COMMON_OUTPUT_SHAPE_BLOCK = `
Return only valid JSON with this shape:
[
  {
    "p": string,
    "o": [[string] | [string, string]]
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
- o is options as [text] or [text, explanation] tuples.
- options count must be ${QUESTION_OPTION_COUNT}.
- option text values in o must be unique within the same question.
- the correct answer must always be o[0].
- for language subject, do not include explanation.
- for non-language subjects, if explanation is included, it should be clear and consistent with correctness.
- for non-language subjects, if explanation is included, it should clearly and concisely explain the reason.
- the highest difficulty should be outstandingly challenging.
- answers should not simply repeat the prompt.
- there should be no ambiguiy, the correct answer should logically make sense, and must be clearly correct.
- low difficulty questions should not be lengthy, wordy.
- be creative on the question content, try to cover different knowledge points and scenarios, avoid being repetitive across questions.
`.trim();

export const GENERATOR_LANGUAGE_QUESTION_STYLE_BLOCK = `
Question styles:
1. selecting the correct word/phrase/sentence to fill in the blank in the prompt. No need to explicitly tell or hint the test taker to fill in the blank, showing the blank is sufficient. The blank should be represented by "___" (three underscores) in the prompt.
2. selecting the correct interpretation of the prompt.
3. a realistic dialog is given as the prompt, and the question is to select the correct next line in the dialog.
`.trim();

export function buildDifficultyTargetPrompt(
  subcategory: keyof typeof DIFFICULTY_LADDER_BY_SUBCATEGORY,
  difficulty: string,
): string {
  const profile = DIFFICULTY_LADDER_BY_SUBCATEGORY[subcategory];
  return `difficulty: ${profile.framework} - ${difficulty}`;
}
