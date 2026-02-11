import { QUESTION_TYPES } from "@/lib/meta";
import { isNonEmptyString } from "@/lib/string";
import type { TestRunParams as GenerateQuestionRequest } from "@/app/test/run/questionRunner/session/params";
import type {
  Question,
  QuestionOption,
  QuestionOptionId,
} from "@/app/test/run/questionRunner/types";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_OPENAI_MODEL = "o4-mini";
const OPTION_IDS: QuestionOptionId[] = ["A", "B", "C", "D", "E", "F"];

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

function isQuestionOptionId(value: string): value is QuestionOptionId {
  return OPTION_IDS.includes(value as QuestionOptionId);
}

function isQuestionType(value: unknown): value is Question["questionType"] {
  return (
    value === QUESTION_TYPES.MULTIPLE_CHOICE ||
    value === QUESTION_TYPES.MULTIPLE_ANSWER
  );
}

function parseOption(value: unknown): QuestionOption | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const { id, text, explanation } = value as Record<string, unknown>;

  if (
    !isNonEmptyString(id) ||
    !isQuestionOptionId(id) ||
    !isNonEmptyString(text) ||
    !isNonEmptyString(explanation)
  ) {
    return null;
  }

  return {
    id,
    text: text.trim(),
    explanation: explanation.trim(),
  };
}

function parseOptions(value: unknown): QuestionOption[] | null {
  if (!Array.isArray(value) || value.length < 4 || value.length > 6) {
    return null;
  }

  const options = value.map(parseOption);
  if (options.some((option) => option === null)) {
    return null;
  }

  const typedOptions = options as QuestionOption[];
  const ids = typedOptions.map((option) => option.id);
  const uniqueIds = new Set(ids);

  if (uniqueIds.size !== ids.length) {
    return null;
  }

  const expectedIds = OPTION_IDS.slice(0, typedOptions.length);
  if (!expectedIds.every((id, index) => ids[index] === id)) {
    return null;
  }

  return typedOptions;
}

function parseCorrectOptionIds(
  value: unknown,
  options: QuestionOption[],
): QuestionOptionId[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const optionIdSet = new Set(options.map((option) => option.id));
  const ids: QuestionOptionId[] = [];

  for (const item of value) {
    if (!isNonEmptyString(item) || !isQuestionOptionId(item)) {
      return null;
    }
    if (!optionIdSet.has(item)) {
      return null;
    }
    ids.push(item);
  }

  if (new Set(ids).size !== ids.length) {
    return null;
  }

  return ids;
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

  const parsedOptions = parseOptions(options);
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
    parsedCorrectOptionIds.length !== 1
  ) {
    throw new Error("AI multiple_choice must have exactly one correct option.");
  }

  if (
    questionType === QUESTION_TYPES.MULTIPLE_ANSWER &&
    parsedCorrectOptionIds.length < 2
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
