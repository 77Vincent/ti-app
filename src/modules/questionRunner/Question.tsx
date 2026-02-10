"use client";

import { useEffect, useState } from "react";
import QuestionSkeleton from "./QuestionSkeleton";
import { QUESTION_TYPES, type DifficultyLevel } from "@/lib/meta";
import type {
  Question as QuestionType,
  QuestionOptionId,
} from "./types";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOptionIds, setSelectedOptionIds] = useState<QuestionOptionId[]>([]);

  useEffect(() => {
    let cancelled = false;

    if (currentQuestion) {
      setQuestion(currentQuestion);
      setSelectedOptionIds([]);
      setIsLoadingQuestion(false);
      return () => {
        cancelled = true;
      };
    }

    async function loadInitialQuestion() {
      setIsLoadingQuestion(true);

      try {
        const nextQuestion = await fetchGeneratedQuestion({
          subjectId,
          subcategoryId,
          difficulty,
        });

        if (!cancelled) {
          setQuestion(nextQuestion);
          setSelectedOptionIds([]);
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

    loadInitialQuestion();

    return () => {
      cancelled = true;
    };
  }, [currentQuestion, difficulty, subcategoryId, subjectId]);

  function handleSelectOption(optionId: QuestionOptionId) {
    if (!question || isSubmitting) {
      return;
    }

    if (question.questionType === QUESTION_TYPES.MULTIPLE_ANSWER) {
      setSelectedOptionIds((prevIds) =>
        prevIds.includes(optionId)
          ? prevIds.filter((id) => id !== optionId)
          : [...prevIds, optionId],
      );
      return;
    }

    setSelectedOptionIds([optionId]);
  }

  async function handleSubmit() {
    if (!question || selectedOptionIds.length === 0 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const nextQuestion = await fetchGeneratedQuestion({
        subjectId,
        subcategoryId,
        difficulty,
      });
      setQuestion(nextQuestion);
      setSelectedOptionIds([]);
    } catch (error) {
      toastError(
        error instanceof Error ? error.message : "Failed to load question.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingQuestion) {
    return <QuestionSkeleton />;
  }

  if (!question) {
    return null;
  }

  return (
    <div className="space-y-4">
      <p className="text-base">{question.prompt}</p>

      <div className="space-y-2">
        {question.options.map((option) => (
          <button
            className={`btn w-full justify-start ${
              selectedOptionIds.includes(option.id) ? "btn-primary" : "btn-outline"
            }`}
            key={option.id}
            onClick={() => handleSelectOption(option.id)}
            type="button"
          >
            <span className="font-mono">{option.id}.</span>
            <span>{option.text}</span>
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          className={`btn btn-sm btn-primary ${isSubmitting ? "loading" : ""}`}
          disabled={selectedOptionIds.length === 0 || isSubmitting}
          onClick={handleSubmit}
          type="button"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
