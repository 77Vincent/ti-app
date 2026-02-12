"use client";

import type { DifficultyEnum, GoalEnum, SubjectEnum } from "@/lib/meta";
import { toast } from "@/lib/toast";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  addFavoriteQuestion,
  fetchQuestion,
  isAnonymousQuestionLimitError,
  removeFavoriteQuestion,
} from "../api";
import {
  consumeQuestionQuota,
  createQuestionSessionController,
  writeLocalTestSessionQuestion,
} from "../session";
import type { Question as QuestionType, QuestionOptionId } from "../types";
import {
  INITIAL_QUESTION_SESSION_UI_STATE,
  questionSessionUiReducer,
} from "../session/reducer";
import {
  canSubmitQuestion,
  isActiveFavoriteMutation,
  isFavoriteAuthError,
} from "../utils/questionGuards";
import { useQuestionSelection } from "./useQuestionSelection";

export type UseQuestionInput = {
  subjectId: SubjectEnum;
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
  signInDemand: SignInDemand | null;
  hasSubmitted: boolean;
  selectedOptionIds: QuestionOptionId[];
  selectOption: (optionId: QuestionOptionId) => void;
  toggleFavorite: () => Promise<void>;
  submit: () => Promise<void>;
};

const PREFETCH_BUFFER_SIZE = 1;
export type SignInDemand = "more_questions" | "favorite";

export function useQuestion({
  subjectId,
  subcategoryId,
  difficulty,
  goal,
}: UseQuestionInput): UseQuestionResult {
  const [signInDemand, setSignInDemand] = useState<SignInDemand | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteSubmitting, setIsFavoriteSubmitting] = useState(false);
  const activeQuestionIdRef = useRef<string | null>(null);
  const [uiState, dispatchUiState] = useReducer(
    questionSessionUiReducer,
    INITIAL_QUESTION_SESSION_UI_STATE,
  );
  const { question, isLoadingQuestion, isSubmitting, hasSubmitted } = uiState;
  const { selectedOptionIds, resetSelection, selectOption: selectQuestionOption } =
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
        bufferSize: PREFETCH_BUFFER_SIZE,
        loadQuestion,
      }),
    [loadQuestion],
  );

  const applyLoadedQuestion = useCallback(
    (nextQuestion: QuestionType) => {
      writeLocalTestSessionQuestion(nextQuestion);
      setSignInDemand(null);
      setIsFavorite(false);
      setIsFavoriteSubmitting(false);
      activeQuestionIdRef.current = nextQuestion.id;
      resetSelection();
      dispatchUiState({ type: "questionApplied", question: nextQuestion });
    },
    [resetSelection],
  );

  const loadAndApplyQuestion = useCallback(
    async (
      load: () => Promise<QuestionType>,
      shouldIgnoreResult?: () => boolean,
    ): Promise<void> => {
      try {
        const nextQuestion = await load();

        if (shouldIgnoreResult?.()) {
          return;
        }

        applyLoadedQuestion(nextQuestion);
        void questionSession.prefetchToCapacity();
      } catch (error) {
        if (shouldIgnoreResult?.()) {
          return;
        }

        showLoadError(error);
      }
    },
    [applyLoadedQuestion, questionSession, showLoadError],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadInitialQuestion() {
      dispatchUiState({ type: "initialLoadStarted" });

      await loadAndApplyQuestion(
        () => questionSession.loadInitialQuestion(),
        () => cancelled,
      );

      if (!cancelled) {
        dispatchUiState({ type: "initialLoadFinished" });
      }
    }

    loadInitialQuestion();

    return () => {
      cancelled = true;
      questionSession.clear();
    };
  }, [loadAndApplyQuestion, questionSession]);

  function selectOption(optionId: QuestionOptionId) {
    selectQuestionOption(question, optionId, isSubmitting || hasSubmitted);
  }

  async function submit() {
    if (
      !canSubmitQuestion({
        hasQuestion: Boolean(question),
        hasSubmitted,
        selectedOptionCount: selectedOptionIds.length,
        isSubmitting,
        isFavoriteSubmitting,
      })
    ) {
      return;
    }

    if (!hasSubmitted) {
      try {
        await consumeQuestionQuota();
      } catch (error) {
        if (isAnonymousQuestionLimitError(error)) {
          setSignInDemand("more_questions");
          return;
        }

        toast.error(error, {
          fallbackDescription: "Failed to submit answer.",
        });
        return;
      }

      dispatchUiState({ type: "submissionMarked" });
      return;
    }

    if (questionSession.hasBufferedQuestion()) {
      await loadAndApplyQuestion(() => questionSession.consumeNextQuestion());
      return;
    }

    dispatchUiState({ type: "submitFetchStarted" });

    try {
      await loadAndApplyQuestion(() => questionSession.consumeNextQuestion());
    } finally {
      dispatchUiState({ type: "submitFetchFinished" });
    }
  }

  async function toggleFavorite() {
    if (!question || isFavoriteSubmitting) {
      return;
    }

    const targetQuestionId = question.id;
    const nextFavoriteState = !isFavorite;
    setIsFavoriteSubmitting(true);

    try {
      if (isFavorite) {
        await removeFavoriteQuestion(question.id);
      } else {
        await addFavoriteQuestion({
          subjectId,
          subcategoryId,
          difficulty,
          goal,
          question,
        });
      }

      if (!isActiveFavoriteMutation(activeQuestionIdRef.current, targetQuestionId)) {
        return;
      }

      setIsFavorite(nextFavoriteState);
    } catch (error) {
      if (!isActiveFavoriteMutation(activeQuestionIdRef.current, targetQuestionId)) {
        return;
      }

      if (isFavoriteAuthError(error)) {
        setSignInDemand("favorite");
        return;
      }

      toast.error(error, {
        fallbackDescription: isFavorite
          ? "Failed to remove favorite."
          : "Failed to favorite question.",
      });
    } finally {
      setIsFavoriteSubmitting(false);
    }
  }

  const isSignInRequired = signInDemand !== null;
  return {
    question,
    isLoadingQuestion,
    isSubmitting,
    isFavorite,
    isFavoriteSubmitting,
    isSignInRequired,
    signInDemand,
    hasSubmitted,
    selectedOptionIds,
    selectOption,
    toggleFavorite,
    submit,
  };
}
