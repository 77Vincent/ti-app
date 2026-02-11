"use client";

import type { QuestionRunnerProps } from "./types";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import { getDifficultyIcon, getGoalIcon, getSubjectIcon } from "@/lib/meta";
import type { SubjectEnum } from "@/lib/meta";
import { createElement } from "react";
import Question from "./QuestionRunner";

export default function QuestionRunner({
  subjectId,
  subcategoryId,
  difficulty,
  goal,
  onEndTest,
}: QuestionRunnerProps) {
  const SubjectIcon = getSubjectIcon(subjectId as SubjectEnum);
  const DifficultyIcon = getDifficultyIcon(difficulty);
  const GoalIcon = getGoalIcon(goal);

  return (
    <div className="w-full max-w-2xl space-y-3">
      <Card shadow="sm">
        <CardBody className="p-6">
          <Question
            difficulty={difficulty}
            goal={goal}
            subcategoryId={subcategoryId}
            subjectId={subjectId}
          />
        </CardBody>
      </Card>

      <div className="flex justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip variant="bordered">
            <span className="inline-flex items-center gap-1.5">
              {createElement(SubjectIcon, { "aria-hidden": true, size: 14 })}
              {subjectId}
            </span>
          </Chip>
          <Chip variant="bordered">
            {subcategoryId}
          </Chip>
          <Chip variant="bordered">
            <span className="inline-flex items-center gap-1.5">
              {createElement(DifficultyIcon, { "aria-hidden": true, size: 14 })}
              {difficulty}
            </span>
          </Chip>
          <Chip variant="bordered">
            <span className="inline-flex items-center gap-1.5">
              {createElement(GoalIcon, { "aria-hidden": true, size: 14 })}
              {goal}
            </span>
          </Chip>
        </div>

        <Button
          aria-label="Quit test"
          onPress={onEndTest}
          size="sm"
          variant="light"
        >
          End Test
        </Button>
      </div>
    </div>
  );
}
