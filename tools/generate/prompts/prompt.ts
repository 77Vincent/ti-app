import type { GenerateQuestionRequest } from "../../types";
import {
  ENGLISH_GENERATOR_SYSTEM_PROMPT,
  buildEnglishGeneratorUserPrompt,
} from "./english";
import {
  CHINESE_GENERATOR_SYSTEM_PROMPT,
  buildChineseGeneratorUserPrompt,
} from "./chinese";
import {
  JAPANESE_GENERATOR_SYSTEM_PROMPT,
  buildJapaneseGeneratorUserPrompt,
} from "./japanese";

export function buildGeneratorSystemPrompt(
  input: GenerateQuestionRequest,
): string {
  switch (input.subcategory) {
    case "english":
      return ENGLISH_GENERATOR_SYSTEM_PROMPT;
    case "chinese":
      return CHINESE_GENERATOR_SYSTEM_PROMPT;
    case "japanese":
      return JAPANESE_GENERATOR_SYSTEM_PROMPT;
    default:
      throw new Error(
        `No generator system prompt configured for subcategory "${input.subcategory}".`,
      );
  }
}

export function buildGeneratorUserPrompt(input: GenerateQuestionRequest): string {
  switch (input.subcategory) {
    case "english":
      return buildEnglishGeneratorUserPrompt(input);
    case "chinese":
      return buildChineseGeneratorUserPrompt(input);
    case "japanese":
      return buildJapaneseGeneratorUserPrompt(input);
    default:
      throw new Error(
        `No generator user prompt configured for subcategory "${input.subcategory}".`,
      );
  }
}
