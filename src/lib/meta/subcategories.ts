import {
  QUESTION_TYPES,
  type SubcategoryEntry,
} from "./types";

export const SUBCATEGORY_CATALOG: SubcategoryEntry[] = [
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
