"use client";

import type {
  DifficultyEnum,
  SubjectEnum,
  SubcategoryEnum,
} from "@/lib/meta";
import { toast } from "@/lib/toast";
import { useCallback, useRef, useState } from "react";
import type { Question } from "../types";
import { readFavoriteQuestionState } from "../api";
import { toggleQuestionFavorite } from "../service/favorite";
import { isActiveFavoriteMutation } from "../utils/questionGuards";

type UseQuestionFavoriteInput = {
  subjectId: SubjectEnum;
  subcategoryId: SubcategoryEnum;
  difficulty: DifficultyEnum;
  onAuthRequired: () => void;
};

type UseQuestionFavoriteResult = {
  isFavorite: boolean;
  isFavoriteSyncing: boolean;
  isFavoriteSubmitting: boolean;
  syncFavoriteState: (question: Question | null) => Promise<void>;
  toggleFavorite: (question: Question | null) => Promise<void>;
};

export function useQuestionFavorite({
  subjectId,
  subcategoryId,
  difficulty,
  onAuthRequired,
}: UseQuestionFavoriteInput): UseQuestionFavoriteResult {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteSyncing, setIsFavoriteSyncing] = useState(false);
  const [isFavoriteSubmitting, setIsFavoriteSubmitting] = useState(false);
  const activeQuestionIdRef = useRef<string | null>(null);
  const favoriteByQuestionIdRef = useRef<Record<string, boolean>>({});

  const syncFavoriteState = useCallback(async (question: Question | null) => {
    if (!question) {
      activeQuestionIdRef.current = null;
      setIsFavorite(false);
      setIsFavoriteSyncing(false);
      setIsFavoriteSubmitting(false);
      return;
    }

    const targetQuestionId = question.id;
    activeQuestionIdRef.current = targetQuestionId;
    const cachedFavoriteState = favoriteByQuestionIdRef.current[targetQuestionId];
    if (typeof cachedFavoriteState === "boolean") {
      setIsFavorite(cachedFavoriteState);
      setIsFavoriteSyncing(false);
      return;
    }

    setIsFavoriteSyncing(true);

    try {
      const favoriteState = await readFavoriteQuestionState(targetQuestionId);

      if (!isActiveFavoriteMutation(activeQuestionIdRef.current, targetQuestionId)) {
        return;
      }

      favoriteByQuestionIdRef.current[targetQuestionId] = favoriteState;
      setIsFavorite(favoriteState);
    } catch {
      if (!isActiveFavoriteMutation(activeQuestionIdRef.current, targetQuestionId)) {
        return;
      }

      // Intentionally silent: this runs during question transitions and should not spam
      // users with toasts when favorite-state sync fails transiently.
    } finally {
      if (!isActiveFavoriteMutation(activeQuestionIdRef.current, targetQuestionId)) {
        return;
      }

      setIsFavoriteSyncing(false);
    }
  }, []);

  const toggleFavorite = useCallback(async (question: Question | null) => {
    if (!question || isFavoriteSubmitting || isFavoriteSyncing) {
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
        question,
      });

      if (!isActiveFavoriteMutation(activeQuestionIdRef.current, targetQuestionId)) {
        return;
      }

      if (result.type === "success") {
        favoriteByQuestionIdRef.current[targetQuestionId] = result.isFavorite;
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
  }, [
    difficulty,
    isFavorite,
    isFavoriteSubmitting,
    isFavoriteSyncing,
    onAuthRequired,
    subcategoryId,
    subjectId,
  ]);

  return {
    isFavorite,
    isFavoriteSyncing,
    isFavoriteSubmitting,
    syncFavoriteState,
    toggleFavorite,
  };
}
