import type { ResolveQuestionRequest } from "../types";
import {
  getDeepSeekApiKey,
  requestDeepSeekContent,
} from "../provider/deepseek";
import {
  GENERATOR_MODEL,
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
): Promise<string> {
  return requestDeepSeekContent(
    getDeepSeekApiKey(),
    GENERATOR_MODEL,
    [
      {
        role: "system",
        content: buildResolverSystemPrompt(
          difficultyFramework,
          difficultyLadder,
        ),
      },
      { role: "user", content: buildResolverUserPrompt(input) },
    ],
    RESOLVER_TEMPERATURE,
  );
}
