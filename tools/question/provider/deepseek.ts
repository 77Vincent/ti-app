import { isNonEmptyString } from "../../../src/lib/string";
import { config as loadDotenv } from "dotenv";
import { fileURLToPath } from "node:url";
import {
  AI_API_KEY_ENV_VAR,
  DEEPSEEK_API_URL,
} from "../config/constants";

const TOOL_ENV_PATH = fileURLToPath(new URL("../.env", import.meta.url));
let hasLoadedToolEnv = false;

export type DeepSeekMessage = {
  role: "system" | "user";
  content: string;
};

function loadToolEnvFile(): void {
  if (hasLoadedToolEnv) {
    return;
  }
  hasLoadedToolEnv = true;

  const result = loadDotenv({
    override: false,
    path: TOOL_ENV_PATH,
  });
  if (
    result.error &&
    (result.error as NodeJS.ErrnoException).code !== "ENOENT"
  ) {
    throw result.error;
  }
}

export function getDeepSeekApiKey(): string {
  loadToolEnvFile();

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
