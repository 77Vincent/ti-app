import type { SubjectEnum } from "./subjects";

// Subcategory Options
export type SubcategoryOption = {
    id: string;
    label: string;
    subjectId: SubjectEnum;
    order: number;
    questionTypesAllowed: QuestionType[];
};

// Question Types
export type QuestionType = "multiple_choice" | "multiple_answer";
export const QUESTION_TYPES = {
    MULTIPLE_CHOICE: "multiple_choice" as QuestionType,
    MULTIPLE_ANSWER: "multiple_answer" as QuestionType,
};
