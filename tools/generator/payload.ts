import {
  type Question,
  type QuestionOption,
} from "../types";
import { QUESTION_OPTION_COUNT } from "../../src/lib/config/question";
import { isNonEmptyString } from "../../src/lib/string";
import { parseAIJson } from "../utils/json";

export type ParsedAIQuestionPayload = Pick<
  Question,
  "prompt" | "options" | "correctOptionIndexes"
>;

function parseQuestionPayload(value: unknown): ParsedAIQuestionPayload {
  if (!value || typeof value !== "object") {
    throw new Error("AI response shape is invalid.");
  }

  const { p, o } = value as Record<string, unknown>;
  if (!isNonEmptyString(p)) {
    throw new Error("AI response shape is invalid.");
  }

  if (!Array.isArray(o) || o.length !== QUESTION_OPTION_COUNT) {
    throw new Error("AI options are invalid.");
  }
  const options: QuestionOption[] = o.map((item) => {
    if (
      !Array.isArray(item) ||
      (item.length !== 1 && item.length !== 2) ||
      !isNonEmptyString(item[0])
    ) {
      throw new Error("AI options are invalid.");
    }
    if (item.length === 2 && typeof item[1] !== "string") {
      throw new Error("AI options are invalid.");
    }

    return {
      text: item[0].trim(),
      explanation: typeof item[1] === "string" ? item[1].trim() : undefined,
    };
  });

  return {
    prompt: p.trim(),
    options,
    correctOptionIndexes: [0],
  };
}

export function parseAIQuestionPayload(
  content: string,
): ParsedAIQuestionPayload[] {
  let questions: unknown;
  try {
    questions = parseAIJson(content);
  } catch {
    throw new Error("AI response was not valid JSON.");
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("AI response shape is invalid.");
  }

  return questions.map((question) => parseQuestionPayload(question));
}
