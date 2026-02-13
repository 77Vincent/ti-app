"use client";

import { QUESTION_TYPES } from "@/lib/meta";
import { useCallback, useState } from "react";
import type { Question as QuestionType, QuestionOptionId } from "../types";

export type UseQuestionSelectionResult = {
  selectedOptionIds: QuestionOptionId[];
  setSelection: (selectedOptionIds: QuestionOptionId[]) => void;
  selectOption: (
    question: QuestionType | null,
    optionId: QuestionOptionId,
    disabled?: boolean,
  ) => QuestionOptionId[] | null;
};

export function useQuestionSelection(): UseQuestionSelectionResult {
  const [selectedOptionIds, setSelectedOptionIds] = useState<QuestionOptionId[]>([]);

  const setSelection = useCallback((nextSelection: QuestionOptionId[]) => {
    setSelectedOptionIds([...nextSelection]);
  }, []);

  const selectOption = useCallback((
    question: QuestionType | null,
    optionId: QuestionOptionId,
    disabled = false,
  ) => {
    if (!question || disabled) {
      return null;
    }

    let nextSelection: QuestionOptionId[];
    if (question.questionType === QUESTION_TYPES.MULTIPLE_ANSWER) {
      nextSelection = selectedOptionIds.includes(optionId)
        ? selectedOptionIds.filter((id) => id !== optionId)
        : [...selectedOptionIds, optionId];
    } else {
      nextSelection = [optionId];
    }

    setSelectedOptionIds(nextSelection);
    return nextSelection;
  }, [selectedOptionIds]);

  return {
    selectedOptionIds,
    setSelection,
    selectOption,
  };
}
