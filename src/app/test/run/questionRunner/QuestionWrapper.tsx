"use client";

import type { QuestionRunnerProps } from "./types";
import { Button, Card, CardBody, Chip, Tooltip, Divider } from "@heroui/react";
import {
  getDifficultyIcon,
  getDifficultyLabel,
  getGoalIcon,
  getGoalLabel,
  getSubcategoryLabel,
  getSubjectIcon,
  getSubjectLabel,
} from "@/lib/meta";
import { LogOut, Timer } from "lucide-react";
import { createElement, useCallback, useEffect, useState } from "react";
import QuestionRunner from "./QuestionRunner";
import { readLocalTestSessionSnapshot } from "./session";
import { formatElapsedTime } from "./utils/timer";

export default function QuestionWrapper({
  id,
  subjectId,
  subcategoryId,
  difficulty,
  goal,
  startedAtMs,
  onEndTest,
}: QuestionRunnerProps) {
  const readCurrentSessionQuestionIndex = useCallback((): number | null => {
    const snapshot = readLocalTestSessionSnapshot();
    if (!snapshot) {
      return null;
    }

    const { sessionId, currentQuestionIndex } = snapshot;
    const isCurrentSession = sessionId === id;

    return isCurrentSession ? currentQuestionIndex : null;
  }, [id]);

  const [elapsedSeconds, setElapsedSeconds] = useState(() =>
    Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000)),
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number | null>(() =>
    readCurrentSessionQuestionIndex(),
  );
  const handleQuestionApplied = useCallback(() => {
    setCurrentQuestionIndex(readCurrentSessionQuestionIndex());
  }, [readCurrentSessionQuestionIndex]);
  const SubjectIcon = getSubjectIcon(subjectId);
  const DifficultyIcon = getDifficultyIcon(difficulty);
  const GoalIcon = getGoalIcon(goal);
  const subjectLabel = getSubjectLabel(subjectId);
  const subcategoryLabel = getSubcategoryLabel(subcategoryId);
  const difficultyLabel = getDifficultyLabel(difficulty);
  const goalLabel = getGoalLabel(goal);
  const elapsedLabel = formatElapsedTime(elapsedSeconds);

  useEffect(() => {
    const getElapsedSeconds = () =>
      Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000));

    const timer = setInterval(() => {
      setElapsedSeconds(getElapsedSeconds());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [startedAtMs]);

  return (
    <div className="w-full max-w-2xl space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="inline-flex items-center gap-1.5 tabular-nums">
            <Timer aria-hidden size={16} />
            {elapsedLabel}
          </p>
          {currentQuestionIndex !== null ? (
            <>
              <Divider className="h-4" orientation="vertical" />
              <span className="font-medium tabular-nums">Question {currentQuestionIndex + 1}</span>
            </>
          ) : null}
        </div>

        <Tooltip content="End test">
          <Button
            aria-label="End test"
            onPress={onEndTest}
            size="sm"
            isIconOnly
            radius="full"
            variant="light"
          >
            <LogOut aria-hidden size={18} />
          </Button>
        </Tooltip>
      </div>

      <Card shadow="sm">
        <CardBody className="p-6">
          <QuestionRunner
            difficulty={difficulty}
            goal={goal}
            onQuestionApplied={handleQuestionApplied}
            sessionId={id}
            subcategoryId={subcategoryId}
            subjectId={subjectId}
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
