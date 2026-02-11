import type { TestRunParams as GenerateQuestionRequest } from "@/lib/validation/testSession";

export const OPENAI_QUESTION_SYSTEM_PROMPT = `
You generate high-quality assessment questions.

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
- prompt, option text, and explanation may use markdown and LaTeX math syntax.
- options count must be between 3 and 6.
- option ids must start at A and be sequential without gaps.
- correctOptionIds must be a non-empty subset of option ids.
- for "multiple_choice", correctOptionIds length must be exactly 1.
- for "multiple_answer", correctOptionIds length must be at least 2.
- explanations must be concise and explain why each option is correct or incorrect.
- do not include extra keys.
`.trim();

export function buildQuestionUserPrompt(input: GenerateQuestionRequest): string {
  return `
Generate one question for this context:
- subjectId: ${input.subjectId}
- subcategoryId: ${input.subcategoryId}
- difficulty: ${input.difficulty}
- goal: ${input.goal}

Keep the question clear, reliable, and objectively gradable.
`.trim();
}
