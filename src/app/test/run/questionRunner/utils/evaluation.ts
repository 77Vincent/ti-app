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
