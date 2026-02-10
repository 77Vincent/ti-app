import {
  QUESTION_TYPES,
} from "./types";
import type { QuestionType } from "./types";
import type { SubjectEnum } from "./subjects";

export type SubcategoryOption = {
  id: string;
  label: string;
  subjectId: SubjectEnum;
  order: number;
  questionTypesAllowed: QuestionType[];
};

export const SUBCATEGORY_CATALOG: SubcategoryOption[] = [
  {
    id: "english",
    label: "English",
    subjectId: "language",
    order: 1,
    questionTypesAllowed: [
      QUESTION_TYPES.MULTIPLE_CHOICE,
      QUESTION_TYPES.MULTIPLE_ANSWER,
    ],
  },
];
