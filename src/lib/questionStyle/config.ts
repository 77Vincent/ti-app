import type { DifficultyEnum } from "../meta/difficulties";
import type { SubjectEnum } from "../meta/subjects";

type QUESTION_STYLES_OPTIONS =
  "synonym choice with little or no context" | "antonym choice with little or no context"
  | "synonym choice with rich context" | "antonym choice with rich context";

const QUESTION_STYLES_OPTIONS_ENUM: Record<string, QUESTION_STYLES_OPTIONS> = {
  SYNONYM_CHOICE_WITH_LITTLE_OR_NO_CONTEXT: "synonym choice with little or no context",
  ANTONYM_CHOICE_WITH_LITTLE_OR_NO_CONTEXT: "antonym choice with little or no context",
  SYNONYM_CHOICE_WITH_RICH_CONTEXT: "synonym choice with rich context",
  ANTONYM_CHOICE_WITH_RICH_CONTEXT: "antonym choice with rich context",
}

export const QUESTION_STYLES: Partial<
  Record<SubjectEnum, Partial<Record<DifficultyEnum, readonly QUESTION_STYLES_OPTIONS[]>>>
> = {
  language: {
    beginner: [QUESTION_STYLES_OPTIONS_ENUM.SYNONYM_CHOICE_WITH_LITTLE_OR_NO_CONTEXT, QUESTION_STYLES_OPTIONS_ENUM.ANTONYM_CHOICE_WITH_LITTLE_OR_NO_CONTEXT],
    intermediate: [QUESTION_STYLES_OPTIONS_ENUM.SYNONYM_CHOICE_WITH_RICH_CONTEXT, QUESTION_STYLES_OPTIONS_ENUM.ANTONYM_CHOICE_WITH_RICH_CONTEXT],
    advanced: [QUESTION_STYLES_OPTIONS_ENUM.SYNONYM_CHOICE_WITH_RICH_CONTEXT, QUESTION_STYLES_OPTIONS_ENUM.ANTONYM_CHOICE_WITH_RICH_CONTEXT],
    expert: [QUESTION_STYLES_OPTIONS_ENUM.SYNONYM_CHOICE_WITH_RICH_CONTEXT, QUESTION_STYLES_OPTIONS_ENUM.ANTONYM_CHOICE_WITH_RICH_CONTEXT],
  },
};
