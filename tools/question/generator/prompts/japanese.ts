import type { GenerateQuestionRequest } from "../../types";
import { buildDifficultyDescriptionBlock } from "../../../../shared/difficultyLadder";
import {
  buildDifficultyTargetPrompt,
  GENERATOR_COMMON_OUTPUT_SHAPE_BLOCK,
  GENERATOR_COMMON_RULES_BLOCK,
  GENERATOR_LANGUAGE_QUESTION_STYLE_BLOCK,
} from "./common";

export const JAPANESE_GENERATOR_SYSTEM_PROMPT = `
You generate two high-quality assessment questions:
- subject: language
- subcategory: japanese

${GENERATOR_COMMON_OUTPUT_SHAPE_BLOCK}

${buildDifficultyDescriptionBlock("japanese")}

${GENERATOR_LANGUAGE_QUESTION_STYLE_BLOCK}

${GENERATOR_COMMON_RULES_BLOCK}
- question prompt, options and explanations are all in Japanese.
- N5 level questions also test kanji pronounciation where the prompt is only the kanji to be tested, and options are the pronounciation in hiragana, no explanation needed.
- When testing pronounciation, it can be either selecting the correct pronounciation for a given kanji, or selecting the correct kanji for a given pronounciation.
- When testing pronounciation, it should purely focus on the pronounciation itself, not address any other aspect.
`.trim();

export function buildJapaneseGeneratorUserPrompt(
  input: GenerateQuestionRequest,
): string {
  return buildDifficultyTargetPrompt("japanese", input.difficulty);
}
