"use client";

import QuestionSkeleton from "./QuestionSkeleton";
import { PAGE_PATHS } from "@/lib/config/paths";
import { Button } from "@heroui/react";
import Link from "next/link";
import { canSubmitQuestion } from "../utils/questionGuards";
import QuestionPrompt from "./QuestionPrompt";
import QuestionChoice from "./QuestionChoice";
import {
  isOptionCorrect,
  isOptionWrongSelection,
} from "../utils/evaluation";
import type { Question, QuestionOptionId, SignInDemand } from "../types";

type QuestionProps = {
  question: Question | null;
  isLoadingQuestion: boolean;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  selectedOptionIds: QuestionOptionId[];
  isFavoriteSubmitting: boolean;
  isSignInRequired: boolean;
  signInDemand: SignInDemand | null;
  selectOption: (optionId: QuestionOptionId) => void;
  submit: () => Promise<void>;
};

const SIGN_IN_CTA_LABEL_BY_DEMAND: Record<SignInDemand, string> = {
  favorite: "Sign in to save favorites",
  more_questions: "Sign in for more questions",
};

export default function QuestionRunner({
  question,
  isLoadingQuestion,
  isSubmitting,
  hasSubmitted,
  selectedOptionIds,
  isFavoriteSubmitting,
  isSignInRequired,
  signInDemand,
  selectOption,
  submit,
}: QuestionProps) {
  const isLoading = isLoadingQuestion || !question;

  return (
    <div className="relative">
      {isSignInRequired ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <Button as={Link} color="primary" href={PAGE_PATHS.SIGN_IN} size="lg">
            {signInDemand
              ? SIGN_IN_CTA_LABEL_BY_DEMAND[signInDemand]
              : "Sign in to continue"}
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

            <div className="flex items-center justify-end">
              <div className="flex items-center justify-end gap-4">
                <Button
                  color="primary"
                  isDisabled={
                    isFavoriteSubmitting ||
                    !canSubmitQuestion({
                      hasQuestion: true,
                      hasSubmitted,
                      selectedOptionCount: selectedOptionIds.length,
                      isSubmitting,
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
