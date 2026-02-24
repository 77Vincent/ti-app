import type { GenerateQuestionRequest } from "../../types";
import { DIFFICULTY_DESCRIPTION_BY_SUBCATEGORY } from "../../../../shared/difficultyLadder";
import {
  GENERATOR_COMMON_OUTPUT_SHAPE_BLOCK,
  GENERATOR_COMMON_RULES_BLOCK,
} from "./common";

export const JAPANESE_GENERATOR_SYSTEM_PROMPT = `
You generate two high-quality assessment questions:
- subject: language
- subcategory: japanese

${GENERATOR_COMMON_OUTPUT_SHAPE_BLOCK}

Difficulty levels: JLPT - N5, N4, N3, N2, N1
- N5: ${DIFFICULTY_DESCRIPTION_BY_SUBCATEGORY.japanese.N5}
- N4: ${DIFFICULTY_DESCRIPTION_BY_SUBCATEGORY.japanese.N4}
- N3: ${DIFFICULTY_DESCRIPTION_BY_SUBCATEGORY.japanese.N3}
- N2: ${DIFFICULTY_DESCRIPTION_BY_SUBCATEGORY.japanese.N2}
- N1: ${DIFFICULTY_DESCRIPTION_BY_SUBCATEGORY.japanese.N1}

${GENERATOR_COMMON_RULES_BLOCK}
- question and option text should be in Japanese.
`.trim();

export function buildJapaneseGeneratorUserPrompt(
  input: GenerateQuestionRequest,
): string {
  return `difficulty: JLPT - ${input.difficulty}`;
}
