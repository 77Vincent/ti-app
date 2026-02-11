"use client";

import type { DifficultyEnum, GoalEnum } from "@/lib/meta";
import { toast } from "@/lib/toast";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import {
  addFavoriteQuestion,
  fetchGeneratedQuestion,
  isAnonymousQuestionLimitError,
  removeFavoriteQuestion,
} from "../api";
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
  goal: GoalEnum;
};

export type UseQuestionResult = {
  question: QuestionType | null;
  isLoadingQuestion: boolean;
  isSubmitting: boolean;
  isFavorite: boolean;
  isFavoriteSubmitting: boolean;
  isSignInRequired: boolean;
  hasSubmitted: boolean;
  selectedOptionIds: QuestionOptionId[];
  isOptionCorrect: (optionId: QuestionOptionId) => boolean;
  isOptionWrongSelection: (optionId: QuestionOptionId) => boolean;
  selectOption: (optionId: QuestionOptionId) => void;
  toggleFavorite: () => Promise<void>;
  submit: () => Promise<void>;
};

const PREFETCH_BUFFER_SIZE = 2;

export function useQuestion({
  subjectId,
  subcategoryId,
  difficulty,
  goal,
}: UseQuestionInput): UseQuestionResult {
  const [isSignInRequired, setIsSignInRequired] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteSubmitting, setIsFavoriteSubmitting] = useState(false);
  const [uiState, dispatchUiState] = useReducer(
    questionSessionUiReducer,
    INITIAL_QUESTION_SESSION_UI_STATE,
  );
  const { question, isLoadingQuestion, isSubmitting, hasSubmitted } = uiState;
  const { selectedOptionIds, resetSelection, selectOption: selectQuestionOption } =
    useQuestionSelection();

  const showLoadError = useCallback((error: unknown) => {
    if (isAnonymousQuestionLimitError(error)) {
      setIsSignInRequired(true);
      return;
    }

    toast.error(error, {
      fallbackDescription: "Failed to load question.",
    });
  }, []);

  const applyLoadedQuestion = useCallback(
    (nextQuestion: QuestionType) => {
      setIsSignInRequired(false);
      setIsFavorite(false);
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
      goal,
    });
  }, [difficulty, goal, subcategoryId, subjectId]);

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

  async function toggleFavorite() {
    if (!question || isFavoriteSubmitting) {
      return;
    }

    setIsFavoriteSubmitting(true);

    try {
      if (isFavorite) {
        await removeFavoriteQuestion(question.id);
        setIsFavorite(false);
        return;
      }

      await addFavoriteQuestion({
        subjectId,
        subcategoryId,
        difficulty,
        goal,
        question,
      });
      setIsFavorite(true);
    } catch (error) {
      toast.error(error, {
        fallbackDescription: isFavorite
          ? "Failed to remove favorite."
          : "Failed to favorite question.",
      });
    } finally {
      setIsFavoriteSubmitting(false);
    }
  }

  return {
    question,
    isLoadingQuestion,
    isSubmitting,
    isFavorite,
    isFavoriteSubmitting,
    isSignInRequired,
    hasSubmitted,
    selectedOptionIds,
    isOptionCorrect,
    isOptionWrongSelection,
    selectOption,
    toggleFavorite,
    submit,
  };
}
