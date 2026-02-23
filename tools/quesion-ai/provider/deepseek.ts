import { isNonEmptyString } from "../../../src/lib/string";
import {
  AI_API_KEY_ENV_VAR,
  DEEPSEEK_API_URL,
} from "../config/constants";

export type DeepSeekMessage = {
  role: "system" | "user";
  content: string;
};

export function getDeepSeekApiKey(): string {
  const apiKey = process.env[AI_API_KEY_ENV_VAR];
  if (!apiKey) {
    throw new Error("AI_API_KEY is not configured.");
  }

  return apiKey;
}

export async function requestDeepSeekContent(
  apiKey: string,
  model: string,
  messages: DeepSeekMessage[],
): Promise<string> {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
    }),
  });

  const payload = (await response.json()) as {
    error?: { message?: string };
    choices?: Array<{ message?: { content?: string } }>;
  };

  if (!response.ok) {
    const errorMessage = payload.error?.message ?? "AI provider request failed.";
    throw new Error(errorMessage);
  }

  const content = payload.choices?.[0]?.message?.content;
  if (!isNonEmptyString(content)) {
    throw new Error("AI provider returned empty content.");
  }

  return content;
}
