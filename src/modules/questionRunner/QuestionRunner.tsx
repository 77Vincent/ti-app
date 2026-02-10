"use client";

import QuestionSkeleton from "./QuestionSkeleton";
import type { DifficultyEnum } from "@/lib/meta";
import { QUESTION_TYPES } from "@/lib/meta";
import { Button } from "@heroui/react";
import { useQuestion } from "./hooks/useQuestion";
import QuestionPrompt from "./QuestionPrompt";
import QuestionChoice from "./QuestionChoice";

type QuestionProps = {
  subjectId: string;
  subcategoryId: string;
  difficulty: DifficultyEnum;
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

  if (isLoadingQuestion || !question) {
    return <QuestionSkeleton />;
  }

  return (
    <div className="space-y-4">
      <QuestionPrompt markdown={question.prompt} />

      <div className="space-y-3">
        {question.options.map((option) => (
          <QuestionChoice
            hasSubmitted={hasSubmitted}
            isCorrect={isOptionCorrect(option.id)}
            isMultipleAnswer={question.questionType === QUESTION_TYPES.MULTIPLE_ANSWER}
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
        <p className="text-default-400">
          Select {question.correctOptionIds.length}{" "}
          {question.correctOptionIds.length === 1 ? "answer" : "answers"}.
        </p>

        <Button
          color="primary"
          size="sm"
          isDisabled={(!hasSubmitted && selectedOptionIds.length === 0) || isSubmitting}
          isLoading={isSubmitting}
          onPress={submit}
        >
          {hasSubmitted ? "Next" : "Submit"}
        </Button>
      </div>
    </div>
  );
}
