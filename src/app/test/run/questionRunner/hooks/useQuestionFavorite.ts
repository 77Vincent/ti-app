"use client";

import type { DifficultyEnum, GoalEnum, SubjectEnum } from "@/lib/meta";
import { toast } from "@/lib/toast";
import { useCallback, useRef, useState } from "react";
import type { Question } from "../types";
import { toggleQuestionFavorite } from "../service/favorite";
import { isActiveFavoriteMutation } from "../utils/questionGuards";

type UseQuestionFavoriteInput = {
  subjectId: SubjectEnum;
  subcategoryId: string;
  difficulty: DifficultyEnum;
  goal: GoalEnum;
  onAuthRequired: () => void;
};

type UseQuestionFavoriteResult = {
  isFavorite: boolean;
  isFavoriteSubmitting: boolean;
  resetFavoriteState: (questionId: string) => void;
  toggleFavorite: (question: Question | null) => Promise<void>;
};

export function useQuestionFavorite({
  subjectId,
  subcategoryId,
  difficulty,
  goal,
  onAuthRequired,
}: UseQuestionFavoriteInput): UseQuestionFavoriteResult {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteSubmitting, setIsFavoriteSubmitting] = useState(false);
  const activeQuestionIdRef = useRef<string | null>(null);

  const resetFavoriteState = useCallback((questionId: string) => {
    activeQuestionIdRef.current = questionId;
    setIsFavorite(false);
    setIsFavoriteSubmitting(false);
  }, []);

  const toggleFavorite = useCallback(async (question: Question | null) => {
    if (!question || isFavoriteSubmitting) {
      return;
    }

    const targetQuestionId = question.id;
    setIsFavoriteSubmitting(true);

    try {
      const result = await toggleQuestionFavorite({
        isFavorite,
        subjectId,
        subcategoryId,
        difficulty,
        goal,
        question,
      });

      if (!isActiveFavoriteMutation(activeQuestionIdRef.current, targetQuestionId)) {
        return;
      }

      if (result.type === "success") {
        setIsFavorite(result.isFavorite);
        return;
      }

      if (result.type === "auth_required") {
        onAuthRequired();
        return;
      }

      toast.error(result.error, {
        fallbackDescription: isFavorite
          ? "Failed to remove favorite."
          : "Failed to favorite question.",
      });
    } catch (error) {
      if (!isActiveFavoriteMutation(activeQuestionIdRef.current, targetQuestionId)) {
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
  }, [difficulty, goal, isFavorite, isFavoriteSubmitting, onAuthRequired, subcategoryId, subjectId]);

  return {
    isFavorite,
    isFavoriteSubmitting,
    resetFavoriteState,
    toggleFavorite,
  };
}
