import type { ResolveQuestionRequest } from "../types";
import {
  getDeepSeekApiKey,
  requestDeepSeekContent,
} from "../utils/deepseek";
import {
  RESOLVER_MODEL,
  RESOLVER_TEMPERATURE,
} from "../utils/config";
import {
  buildResolverSystemPrompt,
  buildResolverUserPrompt,
} from "./prompt";

export async function requestDeepSeekResolverContent(
  input: ResolveQuestionRequest,
): Promise<string> {
  return requestDeepSeekContent(
    getDeepSeekApiKey(),
    RESOLVER_MODEL,
    [
      {
        role: "system",
        content: buildResolverSystemPrompt(),
      },
      { role: "user", content: buildResolverUserPrompt(input) },
    ],
    RESOLVER_TEMPERATURE,
  );
}
