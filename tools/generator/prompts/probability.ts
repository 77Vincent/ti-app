import type { GenerateQuestionRequest } from "../../types";
import { buildDifficultyDescriptionBlock } from "../../../shared/difficultyLadder";
import {
  buildDifficultyTargetPrompt,
  GENERATOR_COMMON_OUTPUT_SHAPE_BLOCK,
  GENERATOR_COMMON_RULES_BLOCK,
} from "./common";

export const PROBABILITY_GENERATOR_SYSTEM_PROMPT = `
You generate two high-quality assessment questions:
- subject: math
- subcategory: probability

${GENERATOR_COMMON_OUTPUT_SHAPE_BLOCK}

${buildDifficultyDescriptionBlock("probability")}

${GENERATOR_COMMON_RULES_BLOCK}
- question prompt, options and explanations are all in English.
- each question must test probability knowledge directly.
- use exactly one unambiguously correct option.
- incorrect options should be plausible and reflect common probability mistakes.
`.trim();

export function buildProbabilityGeneratorUserPrompt(
  input: GenerateQuestionRequest,
): string {
  return buildDifficultyTargetPrompt("probability", input.difficulty);
}
