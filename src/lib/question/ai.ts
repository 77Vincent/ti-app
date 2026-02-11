import { QUESTION_TYPES } from "@/lib/meta";
import type { QuestionType } from "@/lib/meta";
import {
  hasValidCorrectOptionCount,
  isQuestionType,
  type QuestionOptionId,
  parseCorrectOptionIds,
  parseQuestionOptions,
} from "@/lib/validation/question";
import { isNonEmptyString } from "@/lib/string";
import type { TestRunParams as GenerateQuestionRequest } from "@/lib/validation/testSession";

type QuestionOption = {
  id: QuestionOptionId;
  text: string;
  explanation: string;
};

export type Question = {
  id: string;
  prompt: string;
  questionType: QuestionType;
  options: QuestionOption[];
  correctOptionIds: QuestionOptionId[];
};

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_OPENAI_MODEL = "o4-mini";

const SYSTEM_PROMPT = `
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

function getOpenAIConfig() {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  return { apiKey, model };
}

function buildUserPrompt(input: GenerateQuestionRequest): string {
  return `
Generate one question for this context:
- subjectId: ${input.subjectId}
- subcategoryId: ${input.subcategoryId}
- difficulty: ${input.difficulty}
- goal: ${input.goal}

Keep the question clear, reliable, and objectively gradable.
`.trim();
}

function parseJsonObject(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    const firstBrace = content.indexOf("{");
    const lastBrace = content.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
      throw new Error("AI response was not valid JSON.");
    }

    try {
      return JSON.parse(content.slice(firstBrace, lastBrace + 1));
    } catch {
      throw new Error("AI response was not valid JSON.");
    }
  }
}

function parseQuestionPayload(value: unknown): Omit<Question, "id"> {
  if (!value || typeof value !== "object") {
    throw new Error("AI response shape is invalid.");
  }

  const { questionType, prompt, options, correctOptionIds } =
    value as Record<string, unknown>;

  if (!isQuestionType(questionType) || !isNonEmptyString(prompt)) {
    throw new Error("AI response shape is invalid.");
  }

  const parsedOptions = parseQuestionOptions(options, {
    minOptions: 4,
    maxOptions: 6,
    requireSequentialFromA: true,
  });
  if (!parsedOptions) {
    throw new Error("AI options are invalid.");
  }

  const parsedCorrectOptionIds = parseCorrectOptionIds(
    correctOptionIds,
    parsedOptions,
  );
  if (!parsedCorrectOptionIds) {
    throw new Error("AI correct options are invalid.");
  }

  if (
    questionType === QUESTION_TYPES.MULTIPLE_CHOICE &&
    !hasValidCorrectOptionCount(questionType, parsedCorrectOptionIds)
  ) {
    throw new Error("AI multiple_choice must have exactly one correct option.");
  }

  if (
    questionType === QUESTION_TYPES.MULTIPLE_ANSWER &&
    !hasValidCorrectOptionCount(questionType, parsedCorrectOptionIds)
  ) {
    throw new Error("AI multiple_answer must have at least two correct options.");
  }

  return {
    questionType,
    prompt: prompt.trim(),
    options: parsedOptions,
    correctOptionIds: parsedCorrectOptionIds,
  };
}

function createQuestionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 10);
}

async function requestOpenAIQuestion(
  input: GenerateQuestionRequest,
): Promise<unknown> {
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
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(input) },
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

  return parseJsonObject(content);
}

export async function generateQuestionWithAI(
  input: GenerateQuestionRequest,
): Promise<Question> {
  const rawQuestion = await requestOpenAIQuestion(input);
  const parsedQuestion = parseQuestionPayload(rawQuestion);

  return {
    id: createQuestionId(),
    ...parsedQuestion,
  };
}
