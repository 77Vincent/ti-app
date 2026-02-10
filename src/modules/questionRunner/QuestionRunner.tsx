"use client";

import QuestionSkeleton from "./QuestionSkeleton";
import type { DifficultyLevel } from "@/lib/meta";
import { useQuestion } from "./hooks/useQuestion";

type QuestionProps = {
  subjectId: string;
  subcategoryId: string;
  difficulty: DifficultyLevel;
};

export default function Question({
  subjectId,
  subcategoryId,
  difficulty,
}: QuestionProps) {
  const {
    question,
    isLoadingQuestion,
    isSubmitting,
    hasSubmitted,
    selectedOptionIds,
    isOptionCorrect,
    isOptionWrongSelection,
    selectOption,
    submit,
  } = useQuestion({
    subjectId,
    subcategoryId,
    difficulty,
  });

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
          <div className="space-y-1" key={option.id}>
            <button
              className={`btn w-full justify-start ${
                hasSubmitted
                  ? isOptionCorrect(option.id)
                    ? "btn-success"
                    : isOptionWrongSelection(option.id)
                      ? "btn-error"
                      : "btn-outline"
                  : selectedOptionIds.includes(option.id)
                    ? "btn-primary"
                    : "btn-outline"
              }`}
              disabled={hasSubmitted || isSubmitting}
              onClick={() => selectOption(option.id)}
              type="button"
            >
              <span className="font-mono">{option.id}.</span>
              <span>{option.text}</span>
            </button>

            {hasSubmitted && isOptionCorrect(option.id) ? (
              <p className="text-xs opacity-80">{option.explanation}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          className={`btn btn-sm btn-primary ${isSubmitting ? "loading" : ""}`}
          disabled={(!hasSubmitted && selectedOptionIds.length === 0) || isSubmitting}
          onClick={submit}
          type="button"
        >
          {hasSubmitted ? "Continue" : "Submit"}
        </button>
      </div>
    </div>
  );
}
