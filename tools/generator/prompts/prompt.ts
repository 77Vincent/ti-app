import type {
  GenerateQuestionRequest,
  GenerateQuestionSample,
} from "../../types";
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

function buildGeneratorDifficultyUserPrompt(input: GenerateQuestionRequest): string {
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

export function buildGeneratorUserPromptWithSamples(
  input: GenerateQuestionRequest,
  samples: GenerateQuestionSample[],
): string {
  const difficultyPrompt = buildGeneratorDifficultyUserPrompt(input);
  if (samples.length === 0) {
    return difficultyPrompt;
  }

  const samplePayload = samples.map((sample) => ({
    p: sample.prompt,
    o: sample.options.map((option) => option.text),
  }));

  return `
${difficultyPrompt}

Reference examples from curated samples:
- learn quality and style from them
- do not copy wording or scenarios
- do not reuse or slightly modify the samples
- deduce the underlying knowledge points and skills being tested in the samples 
- cover diverse and various knowledge points based on the samples

${JSON.stringify(samplePayload, null, 2)}
`.trim();
}
