"use client";

import type { DifficultyEnum, GoalEnum, SubjectEnum } from "@/lib/meta";
import { toast } from "@/lib/toast";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import {
  fetchQuestion,
  isAnonymousQuestionLimitError,
} from "../api";
import {
  recordQuestionResult,
  createQuestionSessionController,
} from "../session";
import type {
  Question as QuestionType,
  QuestionOptionId,
  QuestionSignInDemand,
} from "../types";
import {
  INITIAL_QUESTION_SESSION_UI_STATE,
  questionSessionUiReducer,
} from "../session/reducer";
import {
  canSubmitQuestion,
} from "../utils/questionGuards";
import { isAnswerCorrect } from "../utils/evaluation";
import { loadAndApplyQuestion } from "../service/questionLoad";
import { submitQuestion } from "../service/questionSubmit";
import { useQuestionHistory } from "./useQuestionHistory";
import { useQuestionSelection } from "./useQuestionSelection";

export type UseQuestionInput = {
  sessionId: string;
  subjectId: SubjectEnum;
  subcategoryId: string;
  difficulty: DifficultyEnum;
  goal: GoalEnum;
  onQuestionApplied?: () => void;
};

export type UseQuestionResult = {
  question: QuestionType | null;
  isLoadingQuestion: boolean;
  isSubmitting: boolean;
  canGoToPreviousQuestion: boolean;
  isSignInRequired: boolean;
  signInDemand: QuestionSignInDemand | null;
  hasSubmitted: boolean;
  selectedOptionIds: QuestionOptionId[];
  goToPreviousQuestion: () => void;
  selectOption: (optionId: QuestionOptionId) => void;
  submit: () => Promise<void>;
};

export function useQuestion({
  sessionId,
  subjectId,
  subcategoryId,
  difficulty,
  goal,
  onQuestionApplied,
}: UseQuestionInput): UseQuestionResult {
  const [signInDemand, setSignInDemand] =
    useState<QuestionSignInDemand | null>(null);
  const [uiState, dispatchUiState] = useReducer(
    questionSessionUiReducer,
    INITIAL_QUESTION_SESSION_UI_STATE,
  );
  const { question, isLoadingQuestion, isSubmitting, hasSubmitted } = uiState;
  const { selectedOptionIds, setSelection, selectOption: selectQuestionOption } =
    useQuestionSelection();
  const showLoadError = useCallback((error: unknown) => {
    if (isAnonymousQuestionLimitError(error)) {
      setSignInDemand("more_questions");
      return;
    }

    toast.error(error, {
      fallbackDescription: "Failed to load question.",
    });
  }, []);

  const loadQuestion = useCallback(async () => {
    return fetchQuestion({
      subjectId,
      subcategoryId,
      difficulty,
      goal,
    });
  }, [difficulty, goal, subcategoryId, subjectId]);

  const questionSession = useMemo(
    () =>
      createQuestionSessionController<QuestionType>({
        loadQuestion,
      }),
    [loadQuestion],
  );

  const applyQuestionStateToUi = useCallback(
    (questionState: {
      question: QuestionType;
      selectedOptionIds: QuestionOptionId[];
      hasSubmitted: boolean;
    }) => {
      setSignInDemand(null);
      setSelection(questionState.selectedOptionIds);
      dispatchUiState({
        type: "questionApplied",
        question: questionState.question,
        hasSubmitted: questionState.hasSubmitted,
      });
    },
    [setSelection],
  );

  const {
    canGoToPreviousQuestion,
    restoreCurrentQuestion,
    pushLoadedQuestion,
    goToPreviousQuestion,
    goToNextQuestion,
    persistSelection,
    persistSubmission,
  } = useQuestionHistory({
    sessionId,
    onQuestionApplied,
    onQuestionStateApplied: applyQuestionStateToUi,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadInitialQuestion() {
      dispatchUiState({ type: "initialLoadStarted" });

      if (restoreCurrentQuestion()) {
        if (!cancelled) {
          dispatchUiState({ type: "initialLoadFinished" });
        }
        return;
      }

      await loadAndApplyQuestion({
        load: () => questionSession.loadInitialQuestion(),
        onError: showLoadError,
        pushLoadedQuestion,
        shouldIgnoreResult: () => cancelled,
      });

      if (!cancelled) {
        dispatchUiState({ type: "initialLoadFinished" });
      }
    }

    loadInitialQuestion();

    return () => {
      cancelled = true;
      questionSession.clear();
    };
  }, [pushLoadedQuestion, questionSession, restoreCurrentQuestion, showLoadError]);

  function selectOption(optionId: QuestionOptionId) {
    const nextSelection = selectQuestionOption(
      question,
      optionId,
      isSubmitting || hasSubmitted,
    );
    if (!nextSelection) {
      return;
    }

    persistSelection(nextSelection);
  }

  async function submit() {
    if (
      !canSubmitQuestion({
        hasQuestion: Boolean(question),
        hasSubmitted,
        selectedOptionCount: selectedOptionIds.length,
        isSubmitting,
      })
    ) {
      return;
    }

    await submitQuestion({
      hasSubmitted,
      isCurrentAnswerCorrect: isAnswerCorrect(question, selectedOptionIds),
      recordQuestionResult,
      isQuestionLimitError: isAnonymousQuestionLimitError,
      onQuestionLimitReached: () => {
        setSignInDemand("more_questions");
      },
      onError: (error) => {
        toast.error(error, {
          fallbackDescription: "Failed to submit answer.",
        });
      },
      onSubmissionMarked: () => {
        dispatchUiState({ type: "submissionMarked" });
      },
      persistSubmission,
      goToNextQuestion,
      onNextQuestionLoadStarted: () => {
        dispatchUiState({ type: "submitFetchStarted" });
      },
      onNextQuestionLoadFinished: () => {
        dispatchUiState({ type: "submitFetchFinished" });
      },
      loadNextQuestion: () =>
        loadAndApplyQuestion({
          load: () => questionSession.consumeNextQuestion(),
          onError: showLoadError,
          pushLoadedQuestion,
        }),
    });
  }

  const isSignInRequired = signInDemand !== null;
  return {
    question,
    isLoadingQuestion,
    isSubmitting,
    canGoToPreviousQuestion,
    isSignInRequired,
    signInDemand,
    hasSubmitted,
    selectedOptionIds,
    goToPreviousQuestion,
    selectOption,
    submit,
  };
}
