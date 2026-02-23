import type { QuestionResolverInput } from "../types";
import {
  getDeepSeekApiKey,
  requestDeepSeekContent,
} from "../provider/deepseek";
import { RESOLVER_MODEL } from "../config/constants";
import {
  buildResolverUserPrompt,
  buildResolverSystemPrompt,
} from "./prompts/prompt";

export async function requestDeepSeekResolverContent(
  input: QuestionResolverInput,
): Promise<string> {
  return requestDeepSeekContent(getDeepSeekApiKey(), RESOLVER_MODEL, [
    { role: "system", content: buildResolverSystemPrompt() },
    { role: "user", content: buildResolverUserPrompt(input) },
  ]);
}
