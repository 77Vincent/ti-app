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
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body items-center text-center gap-2">
          <h1 className="text-2xl font-medium">Question 1</h1>
          <p className="text-base-content/70">
            Your test has started. The first question is being prepared.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="badge badge-outline badge-primary">{subjectId}</span>
        <span className="badge badge-outline badge-secondary">{subcategoryId}</span>
        <span className="badge badge-outline badge-success">{difficulty}</span>
        {
          questionCount === INFINITE_QUESTION_COUNT
            ? null
            : <span className="badge badge-outline">{questionCount} questions</span>
        }
        {
          timeLimit === INFINITE_TIME_LIMIT_MINUTES
            ? null
            : <span className="badge badge-outline">{timeLimit} minutes</span>
        }
      </div>
    </div>
  );
}
