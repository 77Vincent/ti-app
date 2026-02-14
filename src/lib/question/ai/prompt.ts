import { getDifficulty } from "@/lib/difficulty/utils";
import type { QuestionParam as GenerateQuestionRequest } from "@/lib/testSession/validation";
import { QUESTION_OPTION_LIMITS } from "@/lib/config/questionPolicy";

export const OPENAI_QUESTION_SYSTEM_PROMPT = `
You generate two high-quality assessment questions.

Return only valid JSON with this exact shape:
{
  "q": [
    {
      "t": "mc" | "ma",
      "p": string,
      "o": [[string, string]],
      "a": [number]
    }
  ]
}

Rules:
- output only one JSON object, no markdown, no code fence, no extra prose.
- keep JSON compact and minified (no unnecessary whitespace).
- q length must be exactly 2.
- each question must be objectively gradable.
- prioritize clarity, realism and factual correctness.
- use markdown/LaTeX only when needed.
- t: "mc" means multiple_choice, "ma" means multiple_answer.
- p is the question prompt.
- o is options as [text, explanation] tuples.
- options count must be between ${QUESTION_OPTION_LIMITS.minOptions} and ${QUESTION_OPTION_LIMITS.maxOptions}.
- a is zero-based indexes of correct options in o.
- for t="mc", a length must be exactly 1.
- for t="ma", a length must be at least 2.
- explanations in o must be concise and explain why each option is correct or incorrect.
- use only keys q, t, p, o, a (no extra keys).
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
