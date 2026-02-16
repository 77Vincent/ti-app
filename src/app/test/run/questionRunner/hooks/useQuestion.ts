"use client";

import type {
  DifficultyEnum,
  SubjectEnum,
  SubcategoryEnum,
} from "@/lib/meta";
import { toast } from "@/lib/toast";
import { useCallback, useEffect, useReducer, useState } from "react";
import {
  fetchQuestion,
} from "../api";
import { QuestionRunnerApiError } from "../api/error";
import { recordQuestionResult } from "../session/storage";
import type {
  Question as QuestionType,
  QuestionOptionId,
  QuestionSignInDemand,
} from "../types";
import { localTestSessionService } from "@/lib/testSession/service/browserLocalSession";
import { submitQuestion } from "@/lib/testSession/service/questionSubmit";
import {
  advanceQuestionSession,
  initializeQuestionSessionState,
} from "@/lib/testSession/service/questionSessionWorkflow";
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
  const progress = localTestSessionService.readLocalTestSessionProgress(sessionId);
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

  const loadOneQuestion = useCallback((): Promise<QuestionType> => {
    return loadQuestion();
  }, [loadQuestion]);

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

    async function initializeQuestionState() {
      dispatchUiState({ type: "initialLoadStarted" });
      await initializeQuestionSessionState({
        restoreCurrentQuestion,
        loadInitialQuestion: loadOneQuestion,
        pushLoadedQuestion,
        onError: showLoadError,
        shouldIgnoreResult: () => cancelled,
      });

      if (!cancelled) {
        dispatchUiState({ type: "initialLoadFinished" });
      }
    }

    initializeQuestionState();

    return () => {
      cancelled = true;
    };
  }, [
    loadOneQuestion,
    pushLoadedQuestion,
    restoreCurrentQuestion,
    showLoadError,
  ]);

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
      isQuestionLimitError: (error) =>
        error instanceof QuestionRunnerApiError && error.status === 403,
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
      advanceToNextQuestion: () =>
        advanceQuestionSession({
          consumeNextQuestion: goToNextQuestion,
          loadNextQuestion: loadOneQuestion,
          pushLoadedQuestion,
          onError: showLoadError,
        }),
      onNextQuestionLoadStarted: () => {
        dispatchUiState({ type: "submitFetchStarted" });
      },
      onNextQuestionLoadFinished: () => {
        dispatchUiState({ type: "submitFetchFinished" });
      },
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
