import type { GenerateQuestionRequest } from "../types";
import {
  getDeepSeekApiKey,
  requestDeepSeekContent,
} from "../provider/deepseek";
import {
  AI_MODEL_ENV_VAR,
  DEFAULT_GENERATOR_MODEL,
} from "../config/constants";
import {
  buildGeneratorSystemPrompt,
  buildGeneratorUserPrompt,
} from "./prompts/prompt";

function getGeneratorModel(): string {
  return process.env[AI_MODEL_ENV_VAR] ?? DEFAULT_GENERATOR_MODEL;
}

export async function requestDeepSeekGeneratorContent(
  input: GenerateQuestionRequest,
): Promise<string> {
  return requestDeepSeekContent(
    getDeepSeekApiKey(),
    getGeneratorModel(),
    [
      { role: "system", content: buildGeneratorSystemPrompt(input) },
      { role: "user", content: buildGeneratorUserPrompt(input) },
    ],
  );
}
