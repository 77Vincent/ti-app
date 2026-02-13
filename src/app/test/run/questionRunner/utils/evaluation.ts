import type { Question as QuestionType, QuestionOptionId } from "../types";

export function isOptionCorrect(
  question: QuestionType | null,
  optionId: QuestionOptionId,
): boolean {
  return question ? question.correctOptionIds.includes(optionId) : false;
}

export function isOptionWrongSelection(
  question: QuestionType | null,
  selectedOptionIds: QuestionOptionId[],
  optionId: QuestionOptionId,
): boolean {
  if (!question) {
    return false;
  }

  return selectedOptionIds.includes(optionId) && !isOptionCorrect(question, optionId);
}

export function isAnswerCorrect(
  question: QuestionType | null,
  selectedOptionIds: QuestionOptionId[],
): boolean {
  if (!question) {
    return false;
  }

  const correctOptionIds = question.correctOptionIds;
  if (selectedOptionIds.length !== correctOptionIds.length) {
    return false;
  }

  const selectedOptionIdSet = new Set(selectedOptionIds);
  if (selectedOptionIdSet.size !== selectedOptionIds.length) {
    return false;
  }

  return correctOptionIds.every((optionId) => selectedOptionIdSet.has(optionId));
}
