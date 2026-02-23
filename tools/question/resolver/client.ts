import type { ResolveQuestionRequest } from "../types";
import {
  getDeepSeekApiKey,
  requestDeepSeekContent,
} from "../provider/deepseek";
import { GENERATOR_MODEL, GENERATOR_TEMPERATURE } from "../config/constants";
import { RESOLVER_SYSTEM_PROMPT, buildResolverUserPrompt } from "./prompt";

export async function requestDeepSeekResolverContent(
  input: ResolveQuestionRequest,
): Promise<string> {
  return requestDeepSeekContent(
    getDeepSeekApiKey(),
    GENERATOR_MODEL,
    [
      { role: "system", content: RESOLVER_SYSTEM_PROMPT },
      { role: "user", content: buildResolverUserPrompt(input) },
    ],
    GENERATOR_TEMPERATURE,
  );
}
