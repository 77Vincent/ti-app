"use client";

import confetti from "canvas-confetti";
import { isDifficultyUpgrade } from "@/lib/difficulty";
import type { QuestionRunnerProps, SignInDemand } from "../types";
import { Button, Card, CardBody, Chip, Tooltip } from "@heroui/react";
import {
  getSubcategoryLabel,
  getSubjectIcon,
  getSubjectLabel,
} from "@/lib/meta";
import { Star } from "lucide-react";
import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import QuestionRunner from "./QuestionRunner";
import { useQuestion } from "../hooks/useQuestion";
import { useQuestionFavorite } from "../hooks/useQuestionFavorite";
import { canSubmitQuestion } from "../utils/questionGuards";
import SessionAccuracy from "./SessionAccuracy";
import SessionDifficultyMilestone from "./SessionDifficultyMilestone";

function fireDifficultyUpgradeConfetti() {
  confetti({
    particleCount: 120,
    spread: 80,
    startVelocity: 50,
    origin: { y: 0.7 },
  });
}

export default function QuestionWrapper({
  id,
  subjectId,
  subcategoryId,
  difficulty,
  correctCount: initialCorrectCount,
  submittedCount: initialSubmittedCount,
}: QuestionRunnerProps) {
  const [favoriteAuthRequiredQuestionId, setFavoriteAuthRequiredQuestionId] =
    useState<string | null>(null);
  const previousDifficultyRef = useRef<string>(difficulty);
  const previousSubcategoryRef = useRef(subcategoryId);

  const {
    question,
    isLoadingQuestion,
    isSubmitting,
    difficulty: sessionDifficulty,
    currentQuestionIndex,
    submittedCount,
    correctCount,
    isSignInRequired: isQuestionSignInRequired,
    signInDemand: questionSignInDemand,
    hasSubmitted,
    selectedOptionIndexes,
    selectOption,
    submit,
  } = useQuestion({
    sessionId: id,
    subjectId,
    subcategoryId,
    difficulty,
    initialCorrectCount,
    initialSubmittedCount,
  });
  const handleFavoriteAuthRequired = useCallback(() => {
    if (!question) {
      return;
    }

    setFavoriteAuthRequiredQuestionId(question.id);
  }, [question]);
  const {
    isFavorite,
    isFavoriteSyncing,
    isFavoriteSubmitting,
    syncFavoriteState,
    toggleFavorite,
  } = useQuestionFavorite({
    onAuthRequired: handleFavoriteAuthRequired,
  });

  useEffect(() => {
    void syncFavoriteState(question);
  }, [question, syncFavoriteState]);

  useEffect(() => {
    if (previousSubcategoryRef.current !== subcategoryId) {
      previousSubcategoryRef.current = subcategoryId;
      previousDifficultyRef.current = sessionDifficulty;
      return;
    }

    const previousDifficulty = previousDifficultyRef.current;
    if (
      isDifficultyUpgrade(
        subcategoryId,
        previousDifficulty,
        sessionDifficulty,
      )
    ) {
      fireDifficultyUpgradeConfetti();
    }

    previousDifficultyRef.current = sessionDifficulty;
  }, [sessionDifficulty, subcategoryId]);

  const signInDemand: SignInDemand | null = useMemo(() => {
    if (isQuestionSignInRequired) {
      return questionSignInDemand;
    }

    if (question && favoriteAuthRequiredQuestionId === question.id) {
      return "favorite";
    }

    return null;
  }, [favoriteAuthRequiredQuestionId, isQuestionSignInRequired, question, questionSignInDemand]);
  const isSignInRequired = signInDemand !== null;

  const SubjectIcon = getSubjectIcon(subjectId);
  const subjectLabel = getSubjectLabel(subjectId);
  const subcategoryLabel = getSubcategoryLabel(subcategoryId);

  return (
    <div className="w-full max-w-2xl space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Tooltip content={isFavorite ? "Remove favorite" : "Favorite this question"}>
            <Button
              aria-label={isFavorite ? "Remove favorite question" : "Favorite question"}
              color={isFavorite ? "warning" : "default"}
              isIconOnly
              isDisabled={isFavoriteSubmitting || isFavoriteSyncing || !question || isSignInRequired}
              isLoading={isFavoriteSubmitting || isFavoriteSyncing}
              onPress={() => toggleFavorite(question)}
              radius="full"
              size="sm"
              variant="light"
            >
              <Star
                aria-hidden
                className={isFavorite ? "fill-current" : undefined}
                size={19}
              />
            </Button>
          </Tooltip>

          <span className="font-bold text-lg tabular-nums">
            Q{currentQuestionIndex + 1}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Tooltip content="Accuracy">
            <span>
              <SessionAccuracy
                correctCount={correctCount}
                submittedCount={submittedCount}
              />
            </span>
          </Tooltip>
          <Button
            color="primary"
            isDisabled={
              isFavoriteSubmitting ||
              isSignInRequired ||
              !canSubmitQuestion({
                hasQuestion: Boolean(question),
                hasSubmitted,
                selectedOptionCount: selectedOptionIndexes.length,
                isSubmitting,
              })
            }
            isLoading={isSubmitting}
            onPress={submit}
            radius="full"
            size="sm"
          >
            {hasSubmitted ? "Next" : "Submit"}
          </Button>
        </div>
      </div>

      <Card shadow="sm">
        <CardBody className="p-6">
          <QuestionRunner
            hasSubmitted={hasSubmitted}
            isLoadingQuestion={isLoadingQuestion}
            isSignInRequired={isSignInRequired}
            isSubmitting={isSubmitting}
            question={question}
            selectOption={selectOption}
            selectedOptionIndexes={selectedOptionIndexes}
            signInDemand={signInDemand}
          />
        </CardBody>
      </Card>

      <SessionDifficultyMilestone
        difficulty={sessionDifficulty}
        subcategoryId={subcategoryId}
      />

      <div className="flex flex-wrap items-center gap-1.5">
        <Chip color="primary" variant="bordered">
          <span className="inline-flex items-center gap-1.5">
            {createElement(SubjectIcon, { "aria-hidden": true, size: 14 })}
            {subjectLabel}
          </span>
        </Chip>
        <Chip color="primary" variant="bordered">
          {subcategoryLabel}
        </Chip>
      </div>
    </div>
  );
}
