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
  type DifficultyDescriptions,
} from "./prompt";

export async function requestDeepSeekResolverContent(
  input: ResolveQuestionRequest,
  difficultyFramework: string,
  difficultyLadder: readonly string[],
  difficultyDescriptions: DifficultyDescriptions,
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
