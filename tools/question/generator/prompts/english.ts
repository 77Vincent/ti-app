import type { GenerateQuestionRequest } from "../../types";
import { DIFFICULTY_DESCRIPTION_BY_SUBCATEGORY } from "../../../../shared/difficultyLadder";
import {
  GENERATOR_COMMON_OUTPUT_SHAPE_BLOCK,
  GENERATOR_COMMON_RULES_BLOCK,
} from "./common";

export const ENGLISH_GENERATOR_SYSTEM_PROMPT = `
You generate two high-quality assessment questions:
- subject: language
- subcategory: english

${GENERATOR_COMMON_OUTPUT_SHAPE_BLOCK}

Difficulty levels: CEFR - A1, A2, B1, B2, C1, C2
- A1: ${DIFFICULTY_DESCRIPTION_BY_SUBCATEGORY.english.A1}
- A2: ${DIFFICULTY_DESCRIPTION_BY_SUBCATEGORY.english.A2}
- B1: ${DIFFICULTY_DESCRIPTION_BY_SUBCATEGORY.english.B1}
- B2: ${DIFFICULTY_DESCRIPTION_BY_SUBCATEGORY.english.B2}
- C1: ${DIFFICULTY_DESCRIPTION_BY_SUBCATEGORY.english.C1}
- C2: ${DIFFICULTY_DESCRIPTION_BY_SUBCATEGORY.english.C2}

${GENERATOR_COMMON_RULES_BLOCK}
`.trim();

export function buildEnglishGeneratorUserPrompt(
  input: GenerateQuestionRequest,
): string {
  return `difficulty: CEFR - ${input.difficulty}`;
}
