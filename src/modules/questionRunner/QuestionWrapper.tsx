import type { QuestionRunnerProps } from "./types";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import Question from "./QuestionRunner";

export default function QuestionRunner({
  subjectId,
  subcategoryId,
  difficulty,
}: QuestionRunnerProps) {
  return (
    <div className="mx-auto my-auto max-w-2xl space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-base font-semibold">Question 1</h1>
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip variant="bordered">
            {subjectId}
          </Chip>
          <Chip variant="bordered">
            {subcategoryId}
          </Chip>
          <Chip variant="bordered">
            {difficulty}
          </Chip>
        </div>
      </div>

      <Card shadow="sm">
        <CardBody className="p-6">
          <Question
            difficulty={difficulty}
            subcategoryId={subcategoryId}
            subjectId={subjectId}
          />
        </CardBody>
      </Card>
      <div className="flex justify-end">
        <Button
          aria-label="Quit test"
          size="sm"
          variant="light"
        >
          End Test
        </Button>
      </div>
    </div>
  );
}
