import type { GenerateQuestionRequest } from "../../types";
import { buildDifficultyDescriptionBlock } from "../../../shared/difficultyLadder";
import {
  buildDifficultyTargetPrompt,
  GENERATOR_COMMON_OUTPUT_SHAPE_BLOCK,
  GENERATOR_COMMON_RULES_BLOCK,
  GENERATOR_LANGUAGE_QUESTION_STYLE_BLOCK,
} from "./common";

export const ENGLISH_GENERATOR_SYSTEM_PROMPT = `
You generate two high-quality assessment questions:
- subject: language
- subcategory: english

${GENERATOR_COMMON_OUTPUT_SHAPE_BLOCK}

${buildDifficultyDescriptionBlock("english")}

${GENERATOR_LANGUAGE_QUESTION_STYLE_BLOCK}

${GENERATOR_COMMON_RULES_BLOCK}
- Low difficulty level questions also test spelling where the prompt only asks which option has the correct spelling.
`.trim();

export function buildEnglishGeneratorUserPrompt(
  input: GenerateQuestionRequest,
): string {
  return buildDifficultyTargetPrompt("english", input.difficulty);
}
