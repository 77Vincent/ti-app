"use client";

import QuestionSkeleton from "./QuestionSkeleton";
import type { DifficultyLevel } from "@/lib/meta";
import { useQuestion } from "./useQuestion";

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
    selectedOptionIds,
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
          <button
            className={`btn w-full justify-start ${
              selectedOptionIds.includes(option.id) ? "btn-primary" : "btn-outline"
            }`}
            key={option.id}
            onClick={() => selectOption(option.id)}
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
          onClick={submit}
          type="button"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
