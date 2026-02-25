"use client";

import type {
  QuestionOptionIndex,
  QuestionRunnerProps,
  SignInDemand,
} from "../types";
import { Button, Card, CardBody, Tooltip } from "@heroui/react";
import Mousetrap from "mousetrap";
import { ChevronRight, Star } from "lucide-react";
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

  let signInDemand: SignInDemand | null = null;
  if (isQuestionSignInRequired) {
    signInDemand = questionSignInDemand;
  } else if (question && favoriteAuthRequiredQuestionId === question.id) {
    signInDemand = "favorite";
  }
  const isSignInRequired = signInDemand !== null;
  const canTriggerNext =
    !isFavoriteSubmitting &&
    !isSignInRequired &&
    Boolean(question) &&
    hasSubmitted &&
    !isSubmitting;

  const handleOptionSelect = useCallback((optionIndex: QuestionOptionIndex) => {
    if (!question || isFavoriteSubmitting || isSignInRequired) {
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
  }, [isFavoriteSubmitting, isSignInRequired, question, selectOption, submit]);

  const handleNextPress = useCallback(() => {
    if (!canTriggerNext) {
      return;
    }

    nextActionMidiSfxRef.current?.play();
    void submit();
  }, [canTriggerNext, submit]);

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
    <div className="w-full max-w-2xl space-y-3">
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

        <div className="flex items-center gap-1">
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
        </div>

        {hasSubmitted ? (
          <Button
            aria-label="Next question"
            color="primary"
            isIconOnly
            isDisabled={!canTriggerNext}
            isLoading={isSubmitting}
            onPress={handleNextPress}
            radius="full"
            size="sm"
          >
            {isSubmitting ? null : <ChevronRight aria-hidden size={18} />}
          </Button>
        ) : null}
      </div>

      <Card shadow="sm" className="border border-2 border-primary">
        <CardBody className="p-4">
          <QuestionRunner
            hasSubmitted={hasSubmitted}
            isLoadingQuestion={isLoadingQuestion}
            isSignInRequired={isSignInRequired}
            question={question}
            selectOption={handleOptionSelect}
            selectedOptionIndexes={selectedOptionIndexes}
            signInDemand={signInDemand}
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
