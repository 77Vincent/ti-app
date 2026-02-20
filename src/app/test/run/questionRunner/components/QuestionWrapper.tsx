"use client";

import type { QuestionRunnerProps, SignInDemand } from "../types";
import { Button, Card, CardBody, Chip, Divider, Tooltip } from "@heroui/react";
import {
  getDifficultyIcon,
  getDifficultyLabel,
  getSubcategoryLabel,
  getSubjectIcon,
  getSubjectLabel,
} from "@/lib/meta";
import { Star } from "lucide-react";
import { createElement, useCallback, useEffect, useMemo, useState } from "react";
import QuestionRunner from "./QuestionRunner";
import { useQuestion } from "../hooks/useQuestion";
import { useQuestionFavorite } from "../hooks/useQuestionFavorite";
import ElapsedSessionTimer from "./ElapsedSessionTimer";
import SessionAccuracy from "./SessionAccuracy";

export default function QuestionWrapper({
  id,
  subjectId,
  subcategoryId,
  difficulty,
  startedAtMs,
}: QuestionRunnerProps) {
  const [favoriteAuthRequiredQuestionId, setFavoriteAuthRequiredQuestionId] =
    useState<string | null>(null);

  const {
    question,
    isLoadingQuestion,
    isSubmitting,
    canGoToPreviousQuestion,
    currentQuestionIndex,
    submittedCount,
    correctCount,
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

  const SubjectIcon = getSubjectIcon(subjectId);
  const DifficultyIcon = getDifficultyIcon(difficulty);
  const subjectLabel = getSubjectLabel(subjectId);
  const subcategoryLabel = getSubcategoryLabel(subcategoryId);
  const difficultyLabel = getDifficultyLabel(difficulty);

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

          {currentQuestionIndex !== null ? (
            <span className="font-bold text-lg tabular-nums">
              Q{currentQuestionIndex + 1}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <Tooltip content="Accuracy">
            <span>
              <SessionAccuracy
                correctCount={correctCount}
                submittedCount={submittedCount}
              />
            </span>
          </Tooltip>
          <Divider orientation="vertical" className="h-4"/>
          <Tooltip content="Elapsed time">
            <span>
              <ElapsedSessionTimer startedAtMs={startedAtMs} />
            </span>
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
      </div>
    </div>
  );
}
