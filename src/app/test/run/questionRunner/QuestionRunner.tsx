"use client";

import QuestionSkeleton from "./QuestionSkeleton";
import type { DifficultyEnum } from "@/lib/meta";
import { QUESTION_TYPES } from "@/lib/meta";
import { Button } from "@heroui/react";
import { Star } from "lucide-react";
import Link from "next/link";
import { SIGN_IN_PAGE_PATH } from "@/app/auth/signIn";
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
    isSignInRequired,
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

  if (isSignInRequired) {
    return (
      <div className="relative">
        <QuestionSkeleton className="opacity-70 blur-sm" />
        <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
          <p className="text-lg text-default-600 font-light">Question limit reached</p>
          <Button as={Link} color="primary" href={SIGN_IN_PAGE_PATH} size="lg">
            Sign in to continue
          </Button>
        </div>
      </div>
    );
  }

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
        <p className="font-light text-sm text-default-500">
          Select {question.correctOptionIds.length}{" "}
          {question.correctOptionIds.length === 1 ? "answer" : "answers"}.
        </p>

        <div className="flex items-center gap-3">
          <Button
            aria-label="Favorite question"
            isIconOnly
            size="sm"
            radius="full"
            variant="light"
          >
            <Star aria-hidden size={16} />
          </Button>

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
    </div>
  );
}
