import type { DifficultyLevel } from "@/lib/meta";
import {
  INFINITE_QUESTION_COUNT,
  INFINITE_TIME_LIMIT_MINUTES,
} from "@/modules/startForm/constants";

type QuestionRunnerProps = {
  subjectId: string;
  subcategoryId: string;
  difficulty: DifficultyLevel;
  questionCount: number;
  timeLimit: number;
};

export default function QuestionRunner({
  subjectId,
  subcategoryId,
  difficulty,
  questionCount,
  timeLimit,
}: QuestionRunnerProps) {
  return (
    <div className="my-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-sm font-semibold">Question 1</h1>

        <div className="flex flex-wrap gap-1.5">
          <span className="badge badge-outline badge-primary">{subjectId}</span>
          <span className="badge badge-outline badge-secondary">{subcategoryId}</span>
          <span className="badge badge-outline badge-success">{difficulty}</span>
          {
            questionCount === INFINITE_QUESTION_COUNT
              ? null
              : <span className="badge badge-outline ">{questionCount} Q</span>
          }
          {
            timeLimit === INFINITE_TIME_LIMIT_MINUTES
              ? null
              : <span className="badge badge-outline ">{timeLimit} min</span>
          }
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          question content goes here
        </div>
      </div>
    </div>
  );
}
