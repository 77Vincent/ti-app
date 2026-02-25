import { API_PATHS } from "@/lib/config/paths";
import type {
  SubcategoryEnum,
  SubjectEnum,
} from "@/lib/meta";
import { useEffect, useState } from "react";

type FavoriteQuestionPreview = {
  id: string;
  prompt: string;
};

type FavoriteQuestionsResponse = {
  questions?: Array<{
    id?: unknown;
    prompt?: unknown;
  }>;
};

function parseFavoriteQuestionsResponse(
  payload: unknown,
): FavoriteQuestionPreview[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const questions = (payload as FavoriteQuestionsResponse).questions;
  if (!Array.isArray(questions)) {
    return [];
  }

  return questions.flatMap((question) => {
    if (
      !question ||
      typeof question !== "object" ||
      typeof question.id !== "string" ||
      typeof question.prompt !== "string"
    ) {
      return [];
    }

    return [{ id: question.id, prompt: question.prompt }];
  });
}

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

  useEffect(() => {
    let active = true;

    const searchParams = new URLSearchParams({
      subjectId,
    });

    if (subcategoryId) {
      searchParams.set("subcategoryId", subcategoryId);
    }

    void fetch(`${API_PATHS.QUESTIONS_FAVORITE}?${searchParams.toString()}`, {
      method: "GET",
      cache: "no-store",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load favorite questions.");
        }

        return response.json();
      })
      .then((payload: unknown) => {
        if (!active) {
          return;
        }

        setQuestionsByRequestKey((previous) => ({
          ...previous,
          [requestKey]: parseFavoriteQuestionsResponse(payload),
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

  return {
    isLoading,
    questions,
  };
}
