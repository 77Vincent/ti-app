import type { GenerateQuestionRequest } from "../../types";
import { buildDifficultyDescriptionBlock } from "../../../../shared/difficultyLadder";
import {
  buildDifficultyTargetPrompt,
  GENERATOR_COMMON_OUTPUT_SHAPE_BLOCK,
  GENERATOR_COMMON_RULES_BLOCK,
} from "./common";

export const CHINESE_GENERATOR_SYSTEM_PROMPT = `
You generate two high-quality assessment questions:
- subject: language
- subcategory: chinese

${GENERATOR_COMMON_OUTPUT_SHAPE_BLOCK}

${buildDifficultyDescriptionBlock("chinese")}

${GENERATOR_COMMON_RULES_BLOCK}
- question and option text should be in Simplified Chinese.
- HSK1 level questions also test Chinese character pronunciation where the prompt is only the character to be tested, and options are the pronunciation in pinyin, no explanation needed.
- When testing pronounciation, it can be either selecting the correct pronounciation for a given character, or selecting the correct character for a given pronounciation.
- When testing pronounciation, it should purely focus on the pronounciation itself, not address any other aspect.
`.trim();

export function buildChineseGeneratorUserPrompt(
  input: GenerateQuestionRequest,
): string {
  return buildDifficultyTargetPrompt("chinese", input.difficulty);
}
