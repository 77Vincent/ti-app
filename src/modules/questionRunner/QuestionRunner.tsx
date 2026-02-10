"use client";

import QuestionSkeleton from "./QuestionSkeleton";
import type { DifficultyLevel } from "@/lib/meta";
import { useQuestion } from "./hooks/useQuestion";
import QuestionPrompt from "./QuestionPrompt";
import QuestionChoice from "./QuestionChoice";

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
      <QuestionPrompt markdown={question.prompt} />

      <div className="space-y-2">
        {question.options.map((option) => (
          <QuestionChoice
            hasSubmitted={hasSubmitted}
            isCorrect={isOptionCorrect(option.id)}
            isSelected={selectedOptionIds.includes(option.id)}
            isSubmitting={isSubmitting}
            isWrongSelection={isOptionWrongSelection(option.id)}
            key={option.id}
            onSelect={() => selectOption(option.id)}
            option={option}
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-base-content/50">
          Select {question.correctOptionIds.length}{" "}
          {question.correctOptionIds.length === 1 ? "answer" : "answers"}.
        </p>

        <button
          className={`btn btn-sm btn-primary ${isSubmitting ? "loading" : ""}`}
          disabled={(!hasSubmitted && selectedOptionIds.length === 0) || isSubmitting}
          onClick={submit}
          type="button"
        >
          {hasSubmitted ? "Next" : "Submit"}
        </button>
      </div>
    </div>
  );
}
