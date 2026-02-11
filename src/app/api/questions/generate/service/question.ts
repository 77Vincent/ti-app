import type { TestRunParams } from "@/app/test/run/questionRunner/session/params";
import { generateQuestionWithAI } from "../ai";
import { generateMockQuestion } from "../mock";

function hasOpenAiApiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export async function buildQuestion(input: TestRunParams) {
  if (!hasOpenAiApiKey()) {
    return generateMockQuestion(input);
  }

  return generateQuestionWithAI(input);
}
