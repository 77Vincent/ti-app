import { QUESTION_TYPES, type QuestionType } from "@/lib/meta";
import { QUESTION_OPTION_LIMITS } from "@/lib/config/questionPolicy";
import { isNonEmptyString } from "@/lib/string";

export type QuestionOptionId = "A" | "B" | "C" | "D" | "E" | "F";
export type QuestionOption = {
  id: QuestionOptionId;
  text: string;
  explanation: string;
};

type BaseQuestion = {
  id: string;
  prompt: string;
  questionType: QuestionType;
  options: QuestionOption[];
  correctOptionIds: QuestionOptionId[];
};

export type MultipleChoiceQuestion = BaseQuestion & {
  questionType: typeof QUESTION_TYPES.MULTIPLE_CHOICE;
};

export type MultipleAnswerQuestion = BaseQuestion & {
  questionType: typeof QUESTION_TYPES.MULTIPLE_ANSWER;
};

export type Question = MultipleChoiceQuestion | MultipleAnswerQuestion;

export const QUESTION_OPTION_IDS: QuestionOptionId[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
];

type ParseQuestionOptionsConfig = {
  minOptions?: number;
  maxOptions?: number;
  requireSequentialFromA?: boolean;
};

export type ParsedQuestionOption = QuestionOption;

export function isQuestionType(value: unknown): value is QuestionType {
  return (
    value === QUESTION_TYPES.MULTIPLE_CHOICE ||
    value === QUESTION_TYPES.MULTIPLE_ANSWER
  );
}

export function isQuestionOptionId(value: string): value is QuestionOptionId {
  return QUESTION_OPTION_IDS.includes(value as QuestionOptionId);
}

export function parseQuestionOptions(
  value: unknown,
  config?: ParseQuestionOptionsConfig,
): ParsedQuestionOption[] | null {
  const minOptions = config?.minOptions ?? QUESTION_OPTION_LIMITS.minOptions;
  const maxOptions = config?.maxOptions ?? QUESTION_OPTION_LIMITS.maxOptions;

  if (!Array.isArray(value) || value.length < minOptions || value.length > maxOptions) {
    return null;
  }

  const options: ParsedQuestionOption[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") {
      return null;
    }

    const id = (item as { id?: unknown }).id;
    const text = (item as { text?: unknown }).text;
    const explanation = (item as { explanation?: unknown }).explanation;

    if (
      !isNonEmptyString(id) ||
      !isQuestionOptionId(id) ||
      !isNonEmptyString(text) ||
      !isNonEmptyString(explanation)
    ) {
      return null;
    }

    options.push({
      id,
      text: text.trim(),
      explanation: explanation.trim(),
    });
  }

  const ids = options.map((option) => option.id);
  if (new Set(ids).size !== ids.length) {
    return null;
  }

  if (config?.requireSequentialFromA) {
    const expectedIds = QUESTION_OPTION_IDS.slice(0, options.length);

    if (!expectedIds.every((expectedId, index) => ids[index] === expectedId)) {
      return null;
    }
  }

  return options;
}

export function parseCorrectOptionIds(
  value: unknown,
  options: ParsedQuestionOption[],
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

export function hasValidCorrectOptionCount(
  questionType: QuestionType,
  correctOptionIds: QuestionOptionId[],
): boolean {
  if (questionType === QUESTION_TYPES.MULTIPLE_CHOICE) {
    return correctOptionIds.length === 1;
  }

  if (questionType === QUESTION_TYPES.MULTIPLE_ANSWER) {
    return correctOptionIds.length >= 2;
  }

  return false;
}
