"use client";

import QuestionSkeleton from "./QuestionSkeleton";
import type { DifficultyEnum, GoalEnum, SubjectEnum } from "@/lib/meta";
import { QUESTION_TYPES } from "@/lib/meta";
import { PAGE_PATHS } from "@/lib/config/paths";
import { Button, Tooltip } from "@heroui/react";
import { Star } from "lucide-react";
import Link from "next/link";
import { useQuestion } from "./hooks/useQuestion";
import { canSubmitQuestion } from "./utils/questionGuards";
import QuestionPrompt from "./QuestionPrompt";
import QuestionChoice from "./QuestionChoice";
import {
  isOptionCorrect,
  isOptionWrongSelection,
} from "./utils/evaluation";

type QuestionProps = {
  subjectId: SubjectEnum;
  subcategoryId: string;
  difficulty: DifficultyEnum;
  goal: GoalEnum;
};

export default function Question({
  subjectId,
  subcategoryId,
  difficulty,
  goal,
}: QuestionProps) {
  const {
    question,
    isLoadingQuestion,
    isSubmitting,
    isFavorite,
    isFavoriteSubmitting,
    isSignInRequired,
    hasSubmitted,
    selectedOptionIds,
    selectOption,
    toggleFavorite,
    submit,
  } = useQuestion({
    subjectId,
    subcategoryId,
    difficulty,
    goal,
  });
  const isLoading = isLoadingQuestion || !question;

  return (
    <div className="relative">
      {isSignInRequired ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <Button as={Link} color="primary" href={PAGE_PATHS.SIGN_IN} size="lg">
            Sign in to continue
          </Button>
        </div>
      ) : null}

      <div className={isSignInRequired ? "blur-sm" : ""}>
        {isLoading ? (
          <QuestionSkeleton />
        ) : (
          <div className="space-y-4">
            <QuestionPrompt markdown={question.prompt} />

            <div className="space-y-3">
              {question.options.map((option) => (
                <QuestionChoice
                  hasSubmitted={hasSubmitted}
                  isCorrect={isOptionCorrect(question, option.id)}
                  isMultipleAnswer={question.questionType === QUESTION_TYPES.MULTIPLE_ANSWER}
                  isSelected={selectedOptionIds.includes(option.id)}
                  isSubmitting={isSubmitting}
                  isWrongSelection={isOptionWrongSelection(
                    question,
                    selectedOptionIds,
                    option.id,
                  )}
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

              <div className="flex items-center gap-4">
                <Tooltip content={isFavorite ? "Remove favorite" : "Favorite this question"}>
                  <Button
                    aria-label={isFavorite ? "Remove favorite question" : "Favorite question"}
                    color={isFavorite ? "warning" : "default"}
                    isIconOnly
                    isDisabled={isFavoriteSubmitting}
                    isLoading={isFavoriteSubmitting}
                    onPress={toggleFavorite}
                    radius="full"
                    size="sm"
                    variant={"light"}
                  >
                    <Star
                      aria-hidden
                      className={isFavorite ? "fill-current" : undefined}
                      size={20}
                    />
                  </Button>
                </Tooltip>

                <Button
                  color="primary"
                  isDisabled={
                    !canSubmitQuestion({
                      hasQuestion: true,
                      hasSubmitted,
                      selectedOptionCount: selectedOptionIds.length,
                      isSubmitting,
                      isFavoriteSubmitting,
                    })
                  }
                  isLoading={isSubmitting}
                  onPress={submit}
                >
                  {hasSubmitted ? "Next" : "Submit"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
