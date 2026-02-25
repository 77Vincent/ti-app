import type { GenerateQuestionRequest } from "../../types";
import { DIFFICULTY_LADDER_BY_SUBCATEGORY } from "../../../../shared/difficultyLadder";
import {
  GENERATOR_COMMON_OUTPUT_SHAPE_BLOCK,
  GENERATOR_COMMON_RULES_BLOCK,
} from "./common";

export const CHINESE_GENERATOR_SYSTEM_PROMPT = `
You generate two high-quality assessment questions:
- subject: language
- subcategory: chinese

${GENERATOR_COMMON_OUTPUT_SHAPE_BLOCK}

Difficulty levels: HSK - HSK1, HSK2, HSK3, HSK4, HSK5, HSK6
- HSK1: ${DIFFICULTY_LADDER_BY_SUBCATEGORY.chinese.description.HSK1}
- HSK2: ${DIFFICULTY_LADDER_BY_SUBCATEGORY.chinese.description.HSK2}
- HSK3: ${DIFFICULTY_LADDER_BY_SUBCATEGORY.chinese.description.HSK3}
- HSK4: ${DIFFICULTY_LADDER_BY_SUBCATEGORY.chinese.description.HSK4}
- HSK5: ${DIFFICULTY_LADDER_BY_SUBCATEGORY.chinese.description.HSK5}
- HSK6: ${DIFFICULTY_LADDER_BY_SUBCATEGORY.chinese.description.HSK6}

${GENERATOR_COMMON_RULES_BLOCK}
- question and option text should be in Simplified Chinese.
`.trim();

export function buildChineseGeneratorUserPrompt(
  input: GenerateQuestionRequest,
): string {
  return `difficulty: HSK - ${input.difficulty}`;
}
