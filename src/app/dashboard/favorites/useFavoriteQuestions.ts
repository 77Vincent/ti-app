import type {
  SubcategoryEnum,
  SubjectEnum,
} from "@/lib/meta";
import { useCallback, useEffect, useState } from "react";
import {
  readFavoriteQuestions,
  removeFavoriteQuestion as removeFavoriteQuestionRequest,
  type FavoriteQuestionPreview,
} from "./api";

type UseFavoriteQuestionsInput = {
  subjectId: SubjectEnum;
  subcategoryId?: SubcategoryEnum;
};

export function useFavoriteQuestions({
  subjectId,
  subcategoryId,
}: UseFavoriteQuestionsInput) {
  const requestKey = `${subjectId}:${subcategoryId ?? ""}`;
  const [loadedRequestKey, setLoadedRequestKey] = useState<string | null>(null);
  const [questionsByRequestKey, setQuestionsByRequestKey] = useState<
    Record<string, FavoriteQuestionPreview[]>
  >({});
  const [removingQuestionIds, setRemovingQuestionIds] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    let active = true;
    void readFavoriteQuestions(subjectId, subcategoryId)
      .then((questions) => {
        if (!active) {
          return;
        }

        setQuestionsByRequestKey((previous) => ({
          ...previous,
          [requestKey]: questions,
        }));
        setLoadedRequestKey(requestKey);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setQuestionsByRequestKey((previous) => ({
          ...previous,
          [requestKey]: [],
        }));
        setLoadedRequestKey(requestKey);
      });

    return () => {
      active = false;
    };
  }, [requestKey, subjectId, subcategoryId]);

  const isLoading = loadedRequestKey !== requestKey;
  const questions = questionsByRequestKey[requestKey] ?? [];

  const removeFavoriteQuestion = useCallback(
    async (questionId: string) => {
      setRemovingQuestionIds((previous) => {
        const next = new Set(previous);
        next.add(questionId);
        return next;
      });

      try {
        await removeFavoriteQuestionRequest(questionId);

        setQuestionsByRequestKey((previous) => ({
          ...previous,
          [requestKey]: (previous[requestKey] ?? []).filter(
            (question) => question.id !== questionId,
          ),
        }));
      } finally {
        setRemovingQuestionIds((previous) => {
          const next = new Set(previous);
          next.delete(questionId);
          return next;
        });
      }
    },
    [requestKey],
  );

  return {
    isLoading,
    questions,
    removingQuestionIds,
    removeFavoriteQuestion,
  };
}
