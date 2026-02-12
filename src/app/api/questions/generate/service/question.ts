import type { TestParam } from "@/lib/validation/testSession";
import { generateQuestionWithAI } from "@/lib/question/ai";
import { generateMockQuestion } from "../mock";

function hasOpenAiApiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export async function buildQuestion(input: TestParam) {
  if (!hasOpenAiApiKey()) {
    return generateMockQuestion(input);
  }

  return generateQuestionWithAI(input);
}
