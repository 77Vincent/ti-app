import type { GenerateQuestionRequest } from "../types";
import {
  getDeepSeekApiKey,
  requestDeepSeekContent,
} from "../provider/deepseek";
import { GENERATOR_MODEL } from "../config/constants";
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
  );
}
