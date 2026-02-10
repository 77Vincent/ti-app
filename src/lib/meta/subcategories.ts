import {
  QUESTION_TYPES,
  SUBJECT_CATALOGS,
  type SubcategoryEntry,
} from "./types";

export const SUBCATEGORY_CATALOG: SubcategoryEntry[] = [
  {
    id: "english",
    label: "English",
    subjectId: SUBJECT_CATALOGS.LANGUAGE,
    order: 1,
    questionTypesAllowed: [
      QUESTION_TYPES.MULTIPLE_CHOICE,
      QUESTION_TYPES.MULTIPLE_ANSWER,
    ],
  },
];
