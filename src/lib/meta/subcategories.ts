import {
  QUESTION_TYPES,
  type SubcategoryOption,
} from "./types";

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
