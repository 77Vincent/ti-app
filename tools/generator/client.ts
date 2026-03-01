import type {
  GenerateQuestionRequest,
  GenerateQuestionSample,
} from "../types";
import {
  getDeepSeekApiKey,
  requestDeepSeekContent,
} from "../utils/deepseek";
import {
  GENERATOR_MODEL,
  GENERATOR_TEMPERATURE,
} from "../utils/config";
import {
  buildGeneratorSystemPrompt,
  buildGeneratorUserPromptWithSamples,
} from "./prompts/prompt";

export async function requestDeepSeekGeneratorContent(
  input: GenerateQuestionRequest,
  samples: GenerateQuestionSample[],
): Promise<string> {
  return requestDeepSeekContent(
    getDeepSeekApiKey(),
    GENERATOR_MODEL,
    [
      { role: "system", content: buildGeneratorSystemPrompt(input) },
      { role: "user", content: buildGeneratorUserPromptWithSamples(input, samples) },
    ],
    GENERATOR_TEMPERATURE,
  );
}
