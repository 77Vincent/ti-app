import { QUESTION_OPTION_COUNT } from "../../../../src/lib/config/question";

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
- p and every o[i][0], o[i][1] must be non-empty strings.
- o is options as [text, explanation] tuples.
- options count must be ${QUESTION_OPTION_COUNT}.
- option text values in o must be unique within the same question.
- a is a single zero-based index of the correct option in o.
- a must be an integer within [0, ${QUESTION_OPTION_COUNT - 1}].
- the index of a must evenly spread across the options in o.
- explanations in o must be clear and consistent with correctness.
- the correct option explanation must clearly state why it is correct.
- each incorrect option explanation must clearly state why it is incorrect.
- in general, the higher the difficulty, the longer and richer context the prompt should have.
- the highest difficulty should be outstandingly challenging.
- answers should not simply repeat the prompt.
- two question styles to choose from:
    1. selecting the correct word/phrase/sentence to fill in the blank in the prompt.
    2. selecting the correct interpretation of the prompt.
`.trim();
