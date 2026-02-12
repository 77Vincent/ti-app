import { isNonEmptyString } from "@/lib/string";
import type { TestParam as GenerateQuestionRequest } from "@/lib/validation/testSession";
import {
  buildQuestionUserPrompt,
  OPENAI_QUESTION_SYSTEM_PROMPT,
} from "./prompt";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_OPENAI_MODEL = "o4-mini";

function getOpenAIConfig() {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  return { apiKey, model };
}

export async function requestOpenAIQuestionContent(
  input: GenerateQuestionRequest,
): Promise<string> {
  const { apiKey, model } = getOpenAIConfig();

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: OPENAI_QUESTION_SYSTEM_PROMPT },
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
