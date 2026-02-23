import type { QuestionResolverInput } from "../types";
import {
  getDeepSeekApiKey,
  requestDeepSeekContent,
} from "../provider/deepseek";
import { RESOLVER_MODEL } from "../config/constants";
import {
  buildResolverUserPrompt,
  RESOLVER_SYSTEM_PROMPT,
} from "./prompt";

export async function requestDeepSeekResolverContent(
  input: QuestionResolverInput,
): Promise<string> {
  return requestDeepSeekContent(getDeepSeekApiKey(), RESOLVER_MODEL, [
    { role: "system", content: RESOLVER_SYSTEM_PROMPT },
    { role: "user", content: buildResolverUserPrompt(input) },
  ]);
}
