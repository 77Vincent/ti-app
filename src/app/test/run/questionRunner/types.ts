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

export type SignInDemand = "favorite" | "more_questions";
export type QuestionSignInDemand = Extract<SignInDemand, "more_questions">;

export type QuestionRunnerProps = TestSession;
