import type { Question } from "@/lib/validation/question";
import type { QuestionParam } from "@/lib/testSession/validation";
import { generateQuestionWithAI } from "@/lib/question/ai";
import { generateMockQuestion } from "../mock";

function hasOpenAiApiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export async function buildQuestion(
  input: QuestionParam,
): Promise<[Question, Question]> {
  if (!hasOpenAiApiKey()) {
    return [generateMockQuestion(input), generateMockQuestion(input)];
  }

  return generateQuestionWithAI(input);
}
