"use client";

import type { QuestionRunnerProps } from "./types";
import { Button, Card, CardBody, Chip, Tooltip } from "@heroui/react";
import {
  getDifficultyIcon,
  getDifficultyLabel,
  getGoalIcon,
  getGoalLabel,
  getSubcategoryLabel,
  getSubjectIcon,
  getSubjectLabel,
} from "@/lib/meta";
import { LogOut, Star, Target } from "lucide-react";
import { createElement, useCallback, useEffect, useMemo, useState } from "react";
import QuestionRunner from "./QuestionRunner";
import type { SignInDemand } from "./types";
import { readLocalTestSessionProgress } from "./session";
import { useQuestion } from "./hooks/useQuestion";
import { useQuestionFavorite } from "./hooks/useQuestionFavorite";
import ElapsedSessionTimer from "./ElapsedSessionTimer";

type SessionProgress = {
  currentQuestionIndex: number | null;
  submittedCount: number;
  correctCount: number;
  accuracyRate: number;
};

const DEFAULT_SESSION_PROGRESS: SessionProgress = {
  currentQuestionIndex: null,
  submittedCount: 0,
  correctCount: 0,
  accuracyRate: 0,
};

export default function QuestionWrapper({
  id,
  subjectId,
  subcategoryId,
  difficulty,
  goal,
  startedAtMs,
  onEndTest,
}: QuestionRunnerProps) {
  const [favoriteAuthRequiredQuestionId, setFavoriteAuthRequiredQuestionId] =
    useState<string | null>(null);

  const {
    question,
    isLoadingQuestion,
    isSubmitting,
    canGoToPreviousQuestion,
    isSignInRequired: isQuestionSignInRequired,
    signInDemand: questionSignInDemand,
    hasSubmitted,
    selectedOptionIds,
    goToPreviousQuestion,
    selectOption,
    submit,
  } = useQuestion({
    sessionId: id,
    subjectId,
    subcategoryId,
    difficulty,
    goal,
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
    subjectId,
    subcategoryId,
    difficulty,
    goal,
    onAuthRequired: handleFavoriteAuthRequired,
  });

  useEffect(() => {
    void syncFavoriteState(question);
  }, [question, syncFavoriteState]);

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
  const sessionProgress = readLocalTestSessionProgress(id) ?? DEFAULT_SESSION_PROGRESS;

  const SubjectIcon = getSubjectIcon(subjectId);
  const DifficultyIcon = getDifficultyIcon(difficulty);
  const GoalIcon = getGoalIcon(goal);
  const subjectLabel = getSubjectLabel(subjectId);
  const subcategoryLabel = getSubcategoryLabel(subcategoryId);
  const difficultyLabel = getDifficultyLabel(difficulty);
  const goalLabel = getGoalLabel(goal);
  const accuracyLabel = `${Math.round(sessionProgress.accuracyRate * 100)}% (${sessionProgress.correctCount}/${sessionProgress.submittedCount})`;

  return (
    <div className="w-full max-w-2xl space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {sessionProgress.currentQuestionIndex !== null ? (
            <span className="font-medium tabular-nums">
              Q{sessionProgress.currentQuestionIndex + 1}
            </span>
          ) : null}
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
                size={18}
              />
            </Button>
          </Tooltip>
        </div>

        <div className="flex items-center gap-3">
          <p className="inline-flex items-center gap-1.5 tabular-nums">
            <Target aria-hidden size={18} />
            {accuracyLabel}
          </p>
          <ElapsedSessionTimer startedAtMs={startedAtMs} />
          <Tooltip content="End test">
            <Button
              aria-label="End test"
              isIconOnly
              onPress={onEndTest}
              radius="full"
              size="sm"
              variant="light"
            >
              <LogOut aria-hidden size={18} />
            </Button>
          </Tooltip>
        </div>
      </div>

      <Card shadow="sm">
        <CardBody className="p-6">
          <QuestionRunner
            canGoToPreviousQuestion={canGoToPreviousQuestion}
            goToPreviousQuestion={goToPreviousQuestion}
            hasSubmitted={hasSubmitted}
            isFavoriteSubmitting={isFavoriteSubmitting}
            isLoadingQuestion={isLoadingQuestion}
            isSignInRequired={isSignInRequired}
            isSubmitting={isSubmitting}
            question={question}
            selectOption={selectOption}
            selectedOptionIds={selectedOptionIds}
            signInDemand={signInDemand}
            submit={submit}
          />
        </CardBody>
      </Card>

      <div className="flex flex-wrap items-center gap-1.5">
        <Chip variant="bordered">
          <span className="inline-flex items-center gap-1.5">
            {createElement(SubjectIcon, { "aria-hidden": true, size: 14 })}
            {subjectLabel}
          </span>
        </Chip>
        <Chip variant="bordered">
          {subcategoryLabel}
        </Chip>
        <Chip variant="bordered">
          <span className="inline-flex items-center gap-1.5">
            {createElement(DifficultyIcon, { "aria-hidden": true, size: 14 })}
            {difficultyLabel}
          </span>
        </Chip>
        <Chip variant="bordered">
          <span className="inline-flex items-center gap-1.5">
            {createElement(GoalIcon, { "aria-hidden": true, size: 14 })}
            {goalLabel}
          </span>
        </Chip>
      </div>
    </div>
  );
}
