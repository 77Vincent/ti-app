"use client";

import type {
  QuestionOptionIndex,
  QuestionRunnerProps,
  AccessDemand,
} from "../types";
import { Button, Card, CardBody } from "@heroui/react";
import { FavoriteIconButton } from "@/app/components";
import { LogOut as LeaveIcon, ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import NextLink from "next/link";
import { PAGE_PATHS } from "@/lib/config/paths";
import {
  triggerLightImpactHaptic,
  triggerSelectionHaptic,
  triggerSuccessHaptic,
  triggerWrongAnswerHaptic,
} from "@/lib/haptics";
import QuestionRunner from "./QuestionRunner";
import MidiSfx, { type MidiSfxHandle } from "./MidiSfx";
import { useEnterToNext } from "../hooks/useEnterToNext";
import { useQuestion } from "../hooks/useQuestion";
import { useQuestionFavorite } from "../hooks/useQuestionFavorite";
import { isAnswerCorrect } from "../utils/evaluation";
import SessionAccuracy from "./SessionAccuracy";
import SessionDifficultyMilestone from "./SessionDifficultyMilestone";

function resolveReadPromptLanguage(subcategoryId: QuestionRunnerProps["subcategoryId"]): string | undefined {
  switch (subcategoryId) {
    case "english":
      return "en-US";
    case "chinese":
      return "zh-CN";
    case "japanese":
      return "ja-JP";
    default:
      return undefined;
  }
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
  const readPromptLanguage = subjectId === "language"
    ? resolveReadPromptLanguage(subcategoryId)
    : undefined;

  const handleOptionSelect = useCallback((optionIndex: QuestionOptionIndex) => {
    if (!question || isFavoriteSubmitting || isAccessBlocked) {
      return;
    }

    triggerSelectionHaptic();

    const nextSelection = selectOption(optionIndex);
    if (!nextSelection) {
      return;
    }

    if (isAnswerCorrect(question, nextSelection)) {
      submitCorrectMidiSfxRef.current?.play();
      triggerSuccessHaptic();
    } else {
      submitWrongMidiSfxRef.current?.play();
      triggerWrongAnswerHaptic();
    }
    void submit(nextSelection);
  }, [isAccessBlocked, isFavoriteSubmitting, question, selectOption, submit]);

  const handleNextPress = useCallback(() => {
    if (!canTriggerNext) {
      return;
    }

    triggerLightImpactHaptic();
    nextActionMidiSfxRef.current?.play();
    void submit();
  }, [canTriggerNext, submit]);

  useEnterToNext(handleNextPress);

  const questionCardBorderClassName = !hasSubmitted || !question
    ? "border-primary"
    : isAnswerCorrect(question, selectedOptionIndexes)
      ? "border-success-500"
      : "border-danger-500";

  return (
    <div className="w-full max-w-3xl space-y-3 pb-20 pt-15 sm:pb-0 sm:pt-0">
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

      <div
        className="fixed inset-x-0 top-0 z-30 px-4 sm:static sm:z-auto sm:px-0"
        style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 0.5rem)" }}
      >
        <div className="mx-auto w-full max-w-3xl">
          <SessionDifficultyMilestone
            difficulty={sessionDifficulty}
            subcategoryId={subcategoryId}
          />
        </div>
      </div>

      <Card shadow="md" className={`border border-2 ${questionCardBorderClassName}`}>
        <CardBody>
          <QuestionRunner
            hasSubmitted={hasSubmitted}
            isLoadingQuestion={isLoadingQuestion}
            isAccessBlocked={isAccessBlocked}
            question={question}
            selectOption={handleOptionSelect}
            selectedOptionIndexes={selectedOptionIndexes}
            accessDemand={accessDemand}
            readPromptLanguage={readPromptLanguage}
            showReadPromptButton={subjectId === "language"}
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
              <div className="flex items-center gap-1.5">
                <Button
                  aria-label="Back to dashboard"
                  as={NextLink}
                  href={PAGE_PATHS.DASHBOARD}
                  isIconOnly
                  variant="light"
                  className="sm:hidden"
                  onPress={triggerLightImpactHaptic}
                >
                  <LeaveIcon aria-hidden size={24} />
                </Button>

                <FavoriteIconButton
                  isFavorite={isFavorite}
                  isDisabled={isFavoriteSubmitting || isFavoriteSyncing || !question || isAccessBlocked}
                  isLoading={isFavoriteSubmitting || isFavoriteSyncing}
                  onPress={() => toggleFavorite(question)}
                />
              </div>

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
                {isSubmitting ? null : <ChevronRight aria-hidden size={24} />}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
