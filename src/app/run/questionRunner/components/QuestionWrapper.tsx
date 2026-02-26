"use client";

import type {
  QuestionOptionIndex,
  QuestionRunnerProps,
  AccessDemand,
} from "../types";
import { Button, Card, CardBody, Tooltip } from "@heroui/react";
import { FavoriteIconButton, ReportIssueIconButton } from "@/app/components";
import { toast } from "@/lib/toast";
import Mousetrap from "mousetrap";
import { ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import QuestionRunner from "./QuestionRunner";
import MidiSfx, { type MidiSfxHandle } from "./MidiSfx";
import { useQuestion } from "../hooks/useQuestion";
import { useQuestionFavorite } from "../hooks/useQuestionFavorite";
import { isAnswerCorrect } from "../utils/evaluation";
import SessionAccuracy from "./SessionAccuracy";
import SessionDifficultyMilestone from "./SessionDifficultyMilestone";

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
  const submitCorrectMidiSfxRef = useRef<MidiSfxHandle | null>(null);
  const submitWrongMidiSfxRef = useRef<MidiSfxHandle | null>(null);
  const nextActionMidiSfxRef = useRef<MidiSfxHandle | null>(null);

  const {
    question,
    isLoadingQuestion,
    isSubmitting,
    difficulty: sessionDifficulty,
    submittedCount,
    correctCount,
    isAccessBlocked: isQuestionAccessBlocked,
    accessDemand: questionAccessDemand,
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

  let accessDemand: AccessDemand | null = null;
  if (isQuestionAccessBlocked) {
    accessDemand = questionAccessDemand;
  } else if (question && favoriteAuthRequiredQuestionId === question.id) {
    accessDemand = "favorite";
  }
  const isAccessBlocked = accessDemand !== null;
  const canTriggerNext =
    !isFavoriteSubmitting &&
    !isAccessBlocked &&
    Boolean(question) &&
    hasSubmitted &&
    !isSubmitting;

  const handleOptionSelect = useCallback((optionIndex: QuestionOptionIndex) => {
    if (!question || isFavoriteSubmitting || isAccessBlocked) {
      return;
    }

    const nextSelection = selectOption(optionIndex);
    if (!nextSelection) {
      return;
    }

    if (isAnswerCorrect(question, nextSelection)) {
      submitCorrectMidiSfxRef.current?.play();
    } else {
      submitWrongMidiSfxRef.current?.play();
    }
    void submit(nextSelection);
  }, [isAccessBlocked, isFavoriteSubmitting, question, selectOption, submit]);

  const handleNextPress = useCallback(() => {
    if (!canTriggerNext) {
      return;
    }

    nextActionMidiSfxRef.current?.play();
    void submit();
  }, [canTriggerNext, submit]);

  const handleReportIssuePress = useCallback(() => {
    if (!question || isAccessBlocked) {
      return;
    }

    toast.info("Issue reporting will be available soon.");
  }, [isAccessBlocked, question]);

  useEffect(() => {
    Mousetrap.bind("enter", (event) => {
      event.preventDefault();
      handleNextPress();
      return false;
    });

    return () => {
      Mousetrap.unbind("enter");
    };
  }, [
    handleNextPress,
  ]);

  return (
    <div className="w-full max-w-3xl space-y-3">
      <MidiSfx
        presetId="submitCorrect"
        ref={submitCorrectMidiSfxRef}
      />
      <MidiSfx
        presetId="submitWrong"
        ref={submitWrongMidiSfxRef}
      />
      <MidiSfx
        presetId="nextAction"
        ref={nextActionMidiSfxRef}
      />

      <div className="flex items-center justify-between gap-2">
        <Tooltip content="Accuracy" placement="right">
          <span>
            <SessionAccuracy
              correctCount={correctCount}
              submittedCount={submittedCount}
            />
          </span>
        </Tooltip>

        <div className="flex items-center gap-3">
          <FavoriteIconButton
            isFavorite={isFavorite}
            isDisabled={isFavoriteSubmitting || isFavoriteSyncing || !question || isAccessBlocked}
            isLoading={isFavoriteSubmitting || isFavoriteSyncing}
            onPress={() => toggleFavorite(question)}
          />
          <ReportIssueIconButton
            isDisabled={isFavoriteSubmitting || isFavoriteSyncing || !question || isAccessBlocked}
            onPress={handleReportIssuePress}
          />
          <Button
            aria-label="Next question"
            color="primary"
            isIconOnly
            variant={hasSubmitted ? "solid" : "light"}
            isDisabled={!canTriggerNext}
            isLoading={isSubmitting}
            onPress={handleNextPress}
            radius="full"
            size="sm"
          >
            {isSubmitting ? null : <ChevronRight strokeWidth={3} aria-hidden size={22} />}
          </Button>
        </div>

      </div>

      <Card shadow="sm" className="border border-2 border-primary">
        <CardBody className="p-4">
          <QuestionRunner
            hasSubmitted={hasSubmitted}
            isLoadingQuestion={isLoadingQuestion}
            isAccessBlocked={isAccessBlocked}
            question={question}
            selectOption={handleOptionSelect}
            selectedOptionIndexes={selectedOptionIndexes}
            accessDemand={accessDemand}
          />
        </CardBody>
      </Card>

      <SessionDifficultyMilestone
        difficulty={sessionDifficulty}
        subcategoryId={subcategoryId}
      />
    </div>
  );
}
