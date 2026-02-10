import {
  INFINITE_QUESTION_COUNT,
  INFINITE_TIME_LIMIT_MINUTES,
} from "@/modules/startForm/constants";
import type { QuestionRunnerProps } from "./types";
import Question from "./Question";

export default function QuestionRunner({
  subjectId,
  subcategoryId,
  difficulty,
  questionCount,
  timeLimit,
  currentQuestion,
}: QuestionRunnerProps) {
  return (
    <div className="my-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-base font-semibold">Question 1</h1>
      </div>

      <div className="card card-border bg-base-100 shadow-sm">
        <div className="card-body">
          <Question
            currentQuestion={currentQuestion}
            difficulty={difficulty}
            subcategoryId={subcategoryId}
            subjectId={subjectId}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="badge badge-outline badge-sm">{subjectId}</span>
        <span className="badge badge-outline badge-sm">{subcategoryId}</span>
        <span className="badge badge-outline badge-sm">{difficulty}</span>
      </div>
    </div>
  );
}
