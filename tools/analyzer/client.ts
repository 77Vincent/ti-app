import type { AnalyzeQuestionRequest } from "../types";
import {
  getDeepSeekApiKey,
  requestDeepSeekContent,
} from "../utils/deepseek";
import {
  ANALYZER_MODEL,
  ANALYZER_TEMPERATURE,
} from "../utils/config";
import {
  buildAnalyzerSystemPrompt,
  buildAnalyzerUserPrompt,
} from "./prompt";

export async function requestDeepSeekAnalyzerContent(
  input: AnalyzeQuestionRequest,
): Promise<string> {
  return requestDeepSeekContent(
    getDeepSeekApiKey(),
    ANALYZER_MODEL,
    [
      {
        role: "system",
        content: buildAnalyzerSystemPrompt(),
      },
      { role: "user", content: buildAnalyzerUserPrompt(input) },
    ],
    ANALYZER_TEMPERATURE,
  );
}
