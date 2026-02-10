"use client";

import { QUESTION_TYPES, type DifficultyLevel } from "@/lib/meta";
import { toastError } from "@/modules/toast/toastBus";
import { useEffect, useState } from "react";
import { fetchGeneratedQuestion } from "./api";
import type { Question as QuestionType, QuestionOptionId } from "./types";

export type UseQuestionInput = {
  subjectId: string;
  subcategoryId: string;
  difficulty: DifficultyLevel;
};

export type UseQuestionResult = {
  question: QuestionType | null;
  isLoadingQuestion: boolean;
  isSubmitting: boolean;
  selectedOptionIds: QuestionOptionId[];
  selectOption: (optionId: QuestionOptionId) => void;
  submit: () => Promise<void>;
};

export function useQuestion({
  subjectId,
  subcategoryId,
  difficulty,
}: UseQuestionInput): UseQuestionResult {
  const [question, setQuestion] = useState<QuestionType | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOptionIds, setSelectedOptionIds] = useState<QuestionOptionId[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialQuestion() {
      setIsLoadingQuestion(true);

      try {
        const nextQuestion = await fetchGeneratedQuestion({
          subjectId,
          subcategoryId,
          difficulty,
        });

        if (!cancelled) {
          setQuestion(nextQuestion);
          setSelectedOptionIds([]);
        }
      } catch (error) {
        if (!cancelled) {
          toastError(
            error instanceof Error ? error.message : "Failed to load question.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingQuestion(false);
        }
      }
    }

    loadInitialQuestion();

    return () => {
      cancelled = true;
    };
  }, [difficulty, subcategoryId, subjectId]);

  function selectOption(optionId: QuestionOptionId) {
    if (!question || isSubmitting) {
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
  }

  async function submit() {
    if (!question || selectedOptionIds.length === 0 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const nextQuestion = await fetchGeneratedQuestion({
        subjectId,
        subcategoryId,
        difficulty,
      });
      setQuestion(nextQuestion);
      setSelectedOptionIds([]);
    } catch (error) {
      toastError(
        error instanceof Error ? error.message : "Failed to load question.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    question,
    isLoadingQuestion,
    isSubmitting,
    selectedOptionIds,
    selectOption,
    submit,
  };
}
