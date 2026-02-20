import type { TestParam } from "@/lib/testSession/validation";
import type {
  Question,
  QuestionOption,
  QuestionOptionId,
} from "@/lib/question/model";

export type {
  Question,
  QuestionOption,
  QuestionOptionId,
};

export type SignInDemand = "favorite" | "more_questions";
export type QuestionSignInDemand = Extract<SignInDemand, "more_questions">;

export type QuestionRunnerProps = TestParam & {
  id: string;
  startedAtMs: number;
};
