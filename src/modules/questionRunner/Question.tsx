"use client";

import { useEffect, useState } from "react";
import QuestionSkeleton from "./QuestionSkeleton";
import type { DifficultyLevel } from "@/lib/meta";
import type { Question as QuestionType } from "./types";
import { fetchGeneratedQuestion } from "./api";
import { toastError } from "@/modules/toast/toastBus";

type QuestionProps = {
  subjectId: string;
  subcategoryId: string;
  difficulty: DifficultyLevel;
  currentQuestion?: QuestionType | null;
};

export default function Question({
  subjectId,
  subcategoryId,
  difficulty,
  currentQuestion,
}: QuestionProps) {
  const [question, setQuestion] = useState<QuestionType | null>(
    currentQuestion ?? null,
  );
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(!currentQuestion);

  useEffect(() => {
    if (currentQuestion) {
      setQuestion(currentQuestion);
      setIsLoadingQuestion(false);
      return;
    }

    let cancelled = false;

    async function loadQuestion() {
      setIsLoadingQuestion(true);

      try {
        const nextQuestion = await fetchGeneratedQuestion({
          subjectId,
          subcategoryId,
          difficulty,
        });

        if (!cancelled) {
          setQuestion(nextQuestion);
        }
      } catch (error) {
        if (!cancelled) {
          toastError(
            error instanceof Error ? error.message : "Failed to load question.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingQuestion(false);
        }
      }
    }

    loadQuestion();

    return () => {
      cancelled = true;
    };
  }, [currentQuestion, difficulty, subcategoryId, subjectId]);

  if (isLoadingQuestion) {
    return <QuestionSkeleton />;
  }

  if (!question) {
    return null;
  }

  return (
    <div className="space-y-4">
      <p className="text-base font-medium">{question.prompt}</p>

      <div className="space-y-2">
        {question.options.map((option) => (
          <button
            className="btn btn-outline w-full justify-start"
            key={option.id}
            type="button"
          >
            <span className="font-mono">{option.id}.</span>
            <span>{option.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
