import type { TestSession } from "@/lib/testSession/validation";
import type {
  Question,
  QuestionOption,
  QuestionOptionIndex,
} from "@/lib/question/model";

export type {
  Question,
  QuestionOption,
  QuestionOptionIndex,
};

export type AccessDemand = "favorite" | "more_questions" | "upgrade_pro";
export type QuestionAccessDemand = Extract<
  AccessDemand,
  "more_questions" | "upgrade_pro"
>;

export type QuestionRunnerProps = TestSession;
