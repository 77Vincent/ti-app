"use client";

import type { DifficultyEnum } from "@/lib/meta";
import { toast } from "@/lib/toast";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import { fetchGeneratedQuestion } from "../api";
import {
  createQuestionSessionController,
} from "../session";
import type { Question as QuestionType, QuestionOptionId } from "../types";
import {
  isOptionCorrect as getIsOptionCorrect,
  isOptionWrongSelection as getIsOptionWrongSelection,
} from "../utils/evaluation";
import {
  INITIAL_QUESTION_SESSION_UI_STATE,
  questionSessionUiReducer,
} from "../session/reducer";
import { useQuestionSelection } from "./useQuestionSelection";

export type UseQuestionInput = {
  subjectId: string;
  subcategoryId: string;
  difficulty: DifficultyEnum;
};

export type UseQuestionResult = {
  question: QuestionType | null;
  isLoadingQuestion: boolean;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  selectedOptionIds: QuestionOptionId[];
  isOptionCorrect: (optionId: QuestionOptionId) => boolean;
  isOptionWrongSelection: (optionId: QuestionOptionId) => boolean;
  selectOption: (optionId: QuestionOptionId) => void;
  submit: () => Promise<void>;
};

const PREFETCH_BUFFER_SIZE = 2;

export function useQuestion({
  subjectId,
  subcategoryId,
  difficulty,
}: UseQuestionInput): UseQuestionResult {
  const [uiState, dispatchUiState] = useReducer(
    questionSessionUiReducer,
    INITIAL_QUESTION_SESSION_UI_STATE,
  );
  const { question, isLoadingQuestion, isSubmitting, hasSubmitted } = uiState;
  const { selectedOptionIds, resetSelection, selectOption: selectQuestionOption } =
    useQuestionSelection();

  const showLoadError = useCallback((error: unknown) => {
    toast.error(error, {
      fallbackDescription: "Failed to load question.",
    });
  }, []);

  const applyLoadedQuestion = useCallback(
    (nextQuestion: QuestionType) => {
      resetSelection();
      dispatchUiState({ type: "questionApplied", question: nextQuestion });
    },
    [resetSelection],
  );

  const loadQuestion = useCallback(async () => {
    return fetchGeneratedQuestion({
      subjectId,
      subcategoryId,
      difficulty,
    });
  }, [difficulty, subcategoryId, subjectId]);

  const questionSession = useMemo(
    () =>
      createQuestionSessionController<QuestionType>({
        bufferSize: PREFETCH_BUFFER_SIZE,
        loadQuestion,
      }),
    [loadQuestion],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadInitialQuestion() {
      dispatchUiState({ type: "initialLoadStarted" });

      try {
        const nextQuestion = await questionSession.loadInitialQuestion();

        if (!cancelled) {
          applyLoadedQuestion(nextQuestion);
        }
      } catch (error) {
        if (!cancelled) {
          showLoadError(error);
        }
      } finally {
        if (!cancelled) {
          dispatchUiState({ type: "initialLoadFinished" });
        }
      }
    }

    loadInitialQuestion();

    return () => {
      cancelled = true;
      questionSession.clear();
    };
  }, [applyLoadedQuestion, questionSession, showLoadError]);

  function selectOption(optionId: QuestionOptionId) {
    selectQuestionOption(question, optionId, isSubmitting || hasSubmitted);
  }

  function isOptionCorrect(optionId: QuestionOptionId): boolean {
    return getIsOptionCorrect(question, optionId);
  }

  function isOptionWrongSelection(optionId: QuestionOptionId): boolean {
    return getIsOptionWrongSelection(question, selectedOptionIds, optionId);
  }

  async function submit() {
    if (!question || selectedOptionIds.length === 0 || isSubmitting) {
      return;
    }

    if (!hasSubmitted) {
      dispatchUiState({ type: "submissionMarked" });
      return;
    }

    if (questionSession.hasBufferedQuestion()) {
      const nextQuestion = await questionSession.consumeNextQuestion();
      applyLoadedQuestion(nextQuestion);
      return;
    }

    dispatchUiState({ type: "submitFetchStarted" });

    try {
      const nextQuestion = await questionSession.consumeNextQuestion();
      applyLoadedQuestion(nextQuestion);
    } catch (error) {
      showLoadError(error);
    } finally {
      dispatchUiState({ type: "submitFetchFinished" });
    }
  }

  return {
    question,
    isLoadingQuestion,
    isSubmitting,
    hasSubmitted,
    selectedOptionIds,
    isOptionCorrect,
    isOptionWrongSelection,
    selectOption,
    submit,
  };
}
