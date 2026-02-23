import { isNonEmptyString } from "../../src/lib/string";
import type { GenerateQuestionRequest } from "./types";
import {
  buildQuestionSystemPrompt,
  buildQuestionUserPrompt,
} from "./prompts/prompt";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEFAULT_AI_MODEL = "deepseek-chat";

function getDeepSeekConfig() {
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL ?? DEFAULT_AI_MODEL;

  if (!apiKey) {
    throw new Error("AI_API_KEY is not configured.");
  }

  return { apiKey, model };
}

export async function requestDeepSeekQuestionContent(
  input: GenerateQuestionRequest,
): Promise<string> {
  const { apiKey, model } = getDeepSeekConfig();

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: buildQuestionSystemPrompt(input) },
        { role: "user", content: buildQuestionUserPrompt(input) },
      ],
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
