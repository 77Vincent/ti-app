"use client";

import type { QuestionRunnerProps } from "./types";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import type { DifficultyEnum, SubjectEnum } from "@/lib/meta";
import {
  Crown,
  Flame,
  Languages,
  Leaf,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import Question from "./QuestionRunner";

const DIFFICULTY_ICON_BY_ID: Record<DifficultyEnum, LucideIcon> = {
  beginner: Leaf,
  intermediate: TrendingUp,
  advanced: Flame,
  expert: Crown,
};

const SUBJECT_ICON_BY_ID: Record<SubjectEnum, LucideIcon> = {
  language: Languages,
};

export default function QuestionRunner({
  subjectId,
  subcategoryId,
  difficulty,
  onEndTest,
}: QuestionRunnerProps) {
  const SubjectIcon = SUBJECT_ICON_BY_ID[subjectId as SubjectEnum];
  const DifficultyIcon = DIFFICULTY_ICON_BY_ID[difficulty];

  return (
    <div className="w-full max-w-2xl space-y-3">
      <Card shadow="sm">
        <CardBody className="p-6">
          <Question
            difficulty={difficulty}
            subcategoryId={subcategoryId}
            subjectId={subjectId}
          />
        </CardBody>
      </Card>

      <div className="flex justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip variant="bordered">
            <span className="inline-flex items-center gap-1.5">
              {SubjectIcon ? <SubjectIcon aria-hidden size={14} /> : null}
              {subjectId}
            </span>
          </Chip>
          <Chip variant="bordered">
            {subcategoryId}
          </Chip>
          <Chip variant="bordered">
            <span className="inline-flex items-center gap-1.5">
              {DifficultyIcon ? <DifficultyIcon aria-hidden size={14} /> : null}
              {difficulty}
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
