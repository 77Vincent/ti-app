import type { ResolveQuestionRequest } from "../types";
import {
  getDeepSeekApiKey,
  requestDeepSeekContent,
} from "../provider/deepseek";
import {
  RESOLVER_MODEL,
  RESOLVER_TEMPERATURE,
} from "../config/constants";
import {
  buildResolverSystemPrompt,
  buildResolverUserPrompt,
} from "./prompt";

export async function requestDeepSeekResolverContent(
  input: ResolveQuestionRequest,
  difficultyFramework: string,
  difficultyLadder: readonly string[],
  difficultyDescriptions: Record<string, string>,
): Promise<string> {
  return requestDeepSeekContent(
    getDeepSeekApiKey(),
    RESOLVER_MODEL,
    [
      {
        role: "system",
        content: buildResolverSystemPrompt(
          difficultyFramework,
          difficultyLadder,
          difficultyDescriptions,
        ),
      },
      { role: "user", content: buildResolverUserPrompt(input) },
    ],
    RESOLVER_TEMPERATURE,
  );
}
