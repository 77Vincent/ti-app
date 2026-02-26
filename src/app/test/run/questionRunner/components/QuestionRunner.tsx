"use client";

import QuestionSkeleton from "./QuestionSkeleton";
import { PAGE_PATHS } from "@/lib/config/paths";
import { Button } from "@heroui/react";
import Link from "next/link";
import QuestionBody from "./QuestionBody";
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

const CTA_BY_DEMAND: Record<SignInDemand, { label: string; href: string }> = {
  favorite: {
    label: "Sign in to save favorites",
    href: PAGE_PATHS.SIGN_IN,
  },
  more_questions: {
    label: "Sign in for more questions",
    href: PAGE_PATHS.SIGN_IN,
  },
  upgrade_pro: {
    label: "Upgrade to Pro for unlimited daily quota",
    href: PAGE_PATHS.DASHBOARD_ACCOUNT,
  },
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
  const cta = signInDemand
    ? CTA_BY_DEMAND[signInDemand]
    : { label: "Sign in to continue", href: PAGE_PATHS.SIGN_IN };

  return (
    <div className="relative">
      {isSignInRequired ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <Button className="shadow-md" as={Link} color="primary" href={cta.href} size="lg">
            {cta.label}
          </Button>
        </div>
      ) : null}

      <div className={isSignInRequired ? "blur-sm" : ""}>
        {isLoading ? (
          <QuestionSkeleton />
        ) : (
          <QuestionBody
            hasSubmitted={hasSubmitted}
            onSelectOption={selectOption}
            question={question}
            selectedOptionIndexes={selectedOptionIndexes}
          />
        )}
      </div>
    </div>
  );
}
