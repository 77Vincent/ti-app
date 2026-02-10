import type { Question as QuestionType, QuestionOptionId } from "../types";

function getCorrectOptionIds(question: QuestionType | null): QuestionOptionId[] {
  if (!question) {
    return [];
  }
  return question.correctOptionIds;
}

export function isOptionCorrect(
  question: QuestionType | null,
  optionId: QuestionOptionId,
): boolean {
  return getCorrectOptionIds(question).includes(optionId);
}

export function isOptionWrongSelection(
  question: QuestionType | null,
  selectedOptionIds: QuestionOptionId[],
  optionId: QuestionOptionId,
): boolean {
  return selectedOptionIds.includes(optionId) && !isOptionCorrect(question, optionId);
}
