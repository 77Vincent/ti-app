"use client";

import QuestionSkeleton from "./QuestionSkeleton";
import { PAGE_PATHS } from "@/lib/config/paths";
import { Button } from "@heroui/react";
import Link from "next/link";
import QuestionPrompt from "./QuestionPrompt";
import QuestionChoice from "./QuestionChoice";
import {
  isOptionCorrect,
  isOptionWrongSelection,
} from "../utils/evaluation";
import type { Question, QuestionOptionIndex, SignInDemand } from "../types";

type QuestionProps = {
  question: Question | null;
  isLoadingQuestion: boolean;
  hasSubmitted: boolean;
  selectedOptionIndexes: QuestionOptionIndex[];
  isSignInRequired: boolean;
  signInDemand: SignInDemand | null;
  selectOption: (optionIndex: QuestionOptionIndex) => void;
};

const SIGN_IN_CTA_LABEL_BY_DEMAND: Record<SignInDemand, string> = {
  favorite: "Sign in to save favorites",
  more_questions: "Sign in for more questions",
};

export default function QuestionRunner({
  question,
  isLoadingQuestion,
  hasSubmitted,
  selectedOptionIndexes,
  isSignInRequired,
  signInDemand,
  selectOption,
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
              {question.options.map((option, optionIndex) => (
                <QuestionChoice
                  hasSubmitted={hasSubmitted}
                  isCorrect={isOptionCorrect(question, optionIndex)}
                  isSelected={selectedOptionIndexes.includes(optionIndex)}
                  isWrongSelection={isOptionWrongSelection(
                    question,
                    selectedOptionIndexes,
                    optionIndex,
                  )}
                  key={optionIndex}
                  onSelect={() => selectOption(optionIndex)}
                  option={option}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
