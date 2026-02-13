import { getDifficulty } from "@/lib/difficulty/utils";
import type { QuestionParam as GenerateQuestionRequest } from "@/lib/validation/testSession";

export const OPENAI_QUESTION_SYSTEM_PROMPT = `
You generate one high-quality assessment question.

Return only valid JSON with this exact shape:
{
  "questionType": "multiple_choice" | "multiple_answer",
  "prompt": string,
  "options": [
    { "id": "A" | "B" | "C" | "D" | "E" | "F", "text": string, "explanation": string }
  ],
  "correctOptionIds": ["A" | "B" | "C" | "D" | "E" | "F"]
}

Rules:
- output only one JSON object, no markdown, no code fence, no extra prose.
- question must be objectively gradable.
- prioritize clarity, realism and factual correctness.
- use markdown/LaTeX only when needed.
- options count must be between 3 and 6.
- option ids must start at A and be sequential without gaps.
- correctOptionIds must be a non-empty subset of option ids.
- for "multiple_choice", correctOptionIds length must be exactly 1.
- for "multiple_answer", correctOptionIds length must be at least 2.
- explanations must be concise and explain why each option is correct or incorrect.
- do not include extra keys.
`.trim();

export function buildQuestionUserPrompt(input: GenerateQuestionRequest): string {
  const mappedDifficulty = getDifficulty(
    input.subjectId,
    input.subcategoryId,
    input.difficulty,
  );
  const difficulty = mappedDifficulty
    ? `${mappedDifficulty.framework} ${mappedDifficulty.level}`
    : input.difficulty;

  return `
Context:
- subject: ${input.subjectId}
- subcategory: ${input.subcategoryId}
- difficulty: ${difficulty}
`.trim();
}
