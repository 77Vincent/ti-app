"use client";

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
import MidiSfx, { type MidiSfxHandle } from "./MidiSfx";
import { useQuestion } from "../hooks/useQuestion";
import { useQuestionFavorite } from "../hooks/useQuestionFavorite";
import { canSubmitQuestion } from "../utils/questionGuards";
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
  const canTriggerSubmit =
    !isFavoriteSubmitting &&
    !isSignInRequired &&
    canSubmitQuestion({
      hasQuestion: Boolean(question),
      hasSubmitted,
      selectedOptionCount: selectedOptionIndexes.length,
      isSubmitting,
    });

  const handleSubmitPress = useCallback(() => {
    if (!canTriggerSubmit) {
      return;
    }

    if (hasSubmitted) {
      nextActionMidiSfxRef.current?.play();
    } else if (isAnswerCorrect(question, selectedOptionIndexes)) {
      submitCorrectMidiSfxRef.current?.play();
    } else {
      submitWrongMidiSfxRef.current?.play();
    }
    void submit();
  }, [canTriggerSubmit, hasSubmitted, question, selectedOptionIndexes, submit]);

  const SubjectIcon = getSubjectIcon(subjectId);
  const subjectLabel = getSubjectLabel(subjectId);
  const subcategoryLabel = getSubcategoryLabel(subcategoryId);

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

          <Tooltip content="Accuracy" placement="right">
            <span>
              <SessionAccuracy
                correctCount={correctCount}
                submittedCount={submittedCount}
              />
            </span>
          </Tooltip>
        </div>

        <Button
          color="primary"
          isDisabled={!canTriggerSubmit}
          isLoading={isSubmitting}
          onPress={handleSubmitPress}
          radius="full"
          size="sm"
        >
          {isSubmitting ? null : hasSubmitted ? "Next" : "Submit"}
        </Button>
      </div>

      <Card shadow="sm">
        <CardBody>
          <QuestionRunner
            hasSubmitted={hasSubmitted}
            isLoadingQuestion={isLoadingQuestion}
            isSignInRequired={isSignInRequired}
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
        <Chip size="sm" color="primary" variant="bordered">
          <span className="inline-flex items-center gap-1.5">
            {createElement(SubjectIcon, { "aria-hidden": true, size: 14 })}
            {subjectLabel}
          </span>
        </Chip>
        <Chip size="sm" color="primary" variant="bordered">
          {subcategoryLabel}
        </Chip>
      </div>
    </div>
  );
}
