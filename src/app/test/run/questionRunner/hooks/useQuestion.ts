"use client";

import type {
  DifficultyEnum,
  SubjectEnum,
  SubcategoryEnum,
} from "@/lib/meta";
import { toast } from "@/lib/toast";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import {
  fetchQuestion,
  isAnonymousQuestionLimitError,
} from "../api";
import {
  recordQuestionResult,
  createQuestionSessionController,
  readLocalTestSessionProgress,
  loadAndApplyQuestion,
  submitQuestion,
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
import { useQuestionHistory } from "./useQuestionHistory";
import { useQuestionSelection } from "./useQuestionSelection";

export type UseQuestionInput = {
  sessionId: string;
  subjectId: SubjectEnum;
  subcategoryId: SubcategoryEnum;
  difficulty: DifficultyEnum;
  onQuestionApplied?: () => void;
};

export type UseQuestionResult = {
  question: QuestionType | null;
  isLoadingQuestion: boolean;
  isSubmitting: boolean;
  canGoToPreviousQuestion: boolean;
  currentQuestionIndex: number | null;
  submittedCount: number;
  correctCount: number;
  isSignInRequired: boolean;
  signInDemand: QuestionSignInDemand | null;
  hasSubmitted: boolean;
  selectedOptionIds: QuestionOptionId[];
  goToPreviousQuestion: () => void;
  selectOption: (optionId: QuestionOptionId) => void;
  submit: () => Promise<void>;
};

function buildSessionProgressState(sessionId: string): {
  currentQuestionIndex: number | null;
  submittedCount: number;
  correctCount: number;
} {
  const progress = readLocalTestSessionProgress(sessionId);
  if (!progress) {
    return {
      currentQuestionIndex: null,
      submittedCount: 0,
      correctCount: 0,
    };
  }

  return progress;
}

export function useQuestion({
  sessionId,
  subjectId,
  subcategoryId,
  difficulty,
  onQuestionApplied,
}: UseQuestionInput): UseQuestionResult {
  const [sessionProgress, setSessionProgress] = useState(
    () => buildSessionProgressState(sessionId),
  );
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

  const loadQuestion = useCallback(() => {
    return fetchQuestion({
      subjectId,
      subcategoryId,
      difficulty,
    });
  }, [difficulty, subcategoryId, subjectId]);

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

  const syncSessionProgress = useCallback(() => {
    setSessionProgress(buildSessionProgressState(sessionId));
  }, [sessionId]);

  const handleQuestionApplied = useCallback(() => {
    syncSessionProgress();
    onQuestionApplied?.();
  }, [onQuestionApplied, syncSessionProgress]);

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
    onQuestionApplied: handleQuestionApplied,
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
      onSubmitRequestStarted: () => {
        dispatchUiState({ type: "submitFetchStarted" });
      },
      onSubmitRequestFinished: () => {
        dispatchUiState({ type: "submitFetchFinished" });
      },
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
      persistSubmission: () => {
        persistSubmission();
        syncSessionProgress();
      },
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
    currentQuestionIndex: sessionProgress.currentQuestionIndex,
    submittedCount: sessionProgress.submittedCount,
    correctCount: sessionProgress.correctCount,
    isSignInRequired,
    signInDemand,
    hasSubmitted,
    selectedOptionIds,
    goToPreviousQuestion,
    selectOption,
    submit,
  };
}
