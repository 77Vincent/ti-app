"use client";

import { QUESTION_TYPES } from "@/lib/meta";
import { useCallback, useState } from "react";
import type { Question as QuestionType, QuestionOptionId } from "../types";

export type UseQuestionSelectionResult = {
  selectedOptionIds: QuestionOptionId[];
  resetSelection: () => void;
  selectOption: (
    question: QuestionType | null,
    optionId: QuestionOptionId,
    disabled?: boolean,
  ) => void;
};

export function useQuestionSelection(): UseQuestionSelectionResult {
  const [selectedOptionIds, setSelectedOptionIds] = useState<QuestionOptionId[]>([]);

  const resetSelection = useCallback(() => {
    setSelectedOptionIds([]);
  }, []);

  const selectOption = useCallback((
    question: QuestionType | null,
    optionId: QuestionOptionId,
    disabled = false,
  ) => {
    if (!question || disabled) {
      return;
    }

    if (question.questionType === QUESTION_TYPES.MULTIPLE_ANSWER) {
      setSelectedOptionIds((prevIds) =>
        prevIds.includes(optionId)
          ? prevIds.filter((id) => id !== optionId)
          : [...prevIds, optionId],
      );
      return;
    }

    setSelectedOptionIds([optionId]);
  }, []);

  return {
    selectedOptionIds,
    resetSelection,
    selectOption,
  };
}
