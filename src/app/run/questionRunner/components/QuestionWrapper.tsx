"use client";

import type {
  QuestionOptionIndex,
  QuestionRunnerProps,
  AccessDemand,
} from "../types";
import { Button, Card, CardBody } from "@heroui/react";
import { FavoriteIconButton } from "@/app/components";
import { ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import QuestionRunner from "./QuestionRunner";
import MidiSfx, { type MidiSfxHandle } from "./MidiSfx";
import { useEnterToNext } from "../hooks/useEnterToNext";
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

  useEnterToNext(handleNextPress);

  return (
    <div className="w-full max-w-3xl space-y-3 pb-20 sm:pb-0">
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

      <SessionDifficultyMilestone
        difficulty={sessionDifficulty}
        subcategoryId={subcategoryId}
      />

      <Card shadow="md" className="border border-2 border-primary">
        <CardBody>
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

      <div
        className="fixed inset-x-0 bottom-0 z-30 px-4 pb-2 sm:static sm:z-auto sm:px-0 sm:pb-0"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0.5rem)" }}
      >
        <Card isBlurred shadow="lg" className="mx-auto w-full max-w-3xl">
          <CardBody className="p-2">
            <div className="flex items-center justify-between gap-2">
              <FavoriteIconButton
                isFavorite={isFavorite}
                isDisabled={isFavoriteSubmitting || isFavoriteSyncing || !question || isAccessBlocked}
                isLoading={isFavoriteSubmitting || isFavoriteSyncing}
                onPress={() => toggleFavorite(question)}
              />

              <SessionAccuracy
                correctCount={correctCount}
                submittedCount={submittedCount}
              />

              <Button
                aria-label="Next question"
                color="primary"
                isIconOnly
                variant="solid"
                isDisabled={!canTriggerNext}
                isLoading={isSubmitting}
                onPress={handleNextPress}
              >
                {isSubmitting ? null : <ChevronRight strokeWidth={3} aria-hidden size={22} />}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
