import type { GenerateQuestionRequest } from "../types";
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
  buildGeneratorUserPrompt,
} from "./prompts/prompt";

export async function requestDeepSeekGeneratorContent(
  input: GenerateQuestionRequest,
): Promise<string> {
  return requestDeepSeekContent(
    getDeepSeekApiKey(),
    GENERATOR_MODEL,
    [
      { role: "system", content: buildGeneratorSystemPrompt(input) },
      { role: "user", content: buildGeneratorUserPrompt(input) },
    ],
    GENERATOR_TEMPERATURE,
  );
}
